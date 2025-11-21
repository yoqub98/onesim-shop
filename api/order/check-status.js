// api/order/check-status.js - Poll eSIMAccess for order status and update DB
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// Send eSIM email notification via Resend
async function sendEsimEmail(order, esim) {
  console.log('📧 [EMAIL] ========== EMAIL SEND STARTING ==========');
  console.log('📧 [EMAIL] Order:', { id: order.id, user_id: order.user_id, order_no: order.order_no });
  console.log('📧 [EMAIL] eSIM:', { iccid: esim.iccid, qrCodeUrl: esim.qrCodeUrl ? 'present' : 'missing' });

  // Validate RESEND_API_KEY
  if (!process.env.RESEND_API_KEY) {
    console.error('📧 [EMAIL] ❌ CRITICAL: RESEND_API_KEY is not set in environment variables!');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  console.log('📧 [EMAIL] ✅ RESEND_API_KEY is configured (length:', process.env.RESEND_API_KEY.length, ')');

  try {
    // Get user email from Supabase auth
    console.log('📧 [EMAIL] Fetching user data for:', order.user_id);
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);

    if (userError) {
      console.error('📧 [EMAIL] ❌ Error fetching user:', userError);
      return { success: false, error: userError.message };
    }

    console.log('📧 [EMAIL] User data retrieved:', { hasUser: !!userData?.user, hasEmail: !!userData?.user?.email });
    const userEmail = userData?.user?.email;
    console.log('📧 [EMAIL] User email:', userEmail || '❌ NOT FOUND');

    if (!userEmail) {
      console.error('📧 [EMAIL] ❌ No email found for user:', order.user_id);
      return { success: false, error: 'No email found' };
    }

    // Build email HTML
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">OneSIM</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Ваш eSIM готов к активации!</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="color: #1a202c; margin-top: 0;">Детали заказа</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">Номер заказа:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${order.order_no}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">Пакет:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${order.package_name || order.package_code}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">ICCID:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${esim.iccid}</td>
            </tr>
          </table>
          <div style="background: #f7fafc; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 15px 0; color: #4a5568; font-weight: 600;">QR-код для активации:</p>
            ${esim.qrCodeUrl
              ? `<img src="${esim.qrCodeUrl}" alt="QR Code" style="max-width: 200px; height: auto;">`
              : `<p style="font-family: monospace; word-break: break-all; background: #edf2f7; padding: 10px; border-radius: 8px; font-size: 12px;">${esim.ac || 'Код недоступен'}</p>`
            }
          </div>
          <h3 style="color: #1a202c;">Инструкция по установке:</h3>
          <ol style="color: #4a5568; line-height: 1.8;">
            <li>Откройте <strong>Настройки</strong> на вашем телефоне</li>
            <li>Перейдите в раздел <strong>Сотовая связь / Мобильные данные</strong></li>
            <li>Выберите <strong>Добавить eSIM</strong> или <strong>Добавить тарифный план</strong></li>
            <li>Отсканируйте QR-код выше</li>
            <li>Подтвердите установку профиля</li>
            <li>Активируйте eSIM и начните использовать!</li>
          </ol>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Важно:</strong> Сохраните это письмо. QR-код можно использовать только один раз.
            </p>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; color: #718096; font-size: 12px;">
          <p>© 2025 OneSIM. Все права защищены.</p>
        </div>
      </div>
    `;

    // Send email via Resend
    console.log('📧 [EMAIL] ========== CALLING RESEND API ==========');
    console.log('📧 [EMAIL] Target email:', userEmail);
    console.log('📧 [EMAIL] Resend URL: https://api.resend.com/emails');

    const resendPayload = {
      from: 'OneSIM <onboarding@resend.dev>',
      to: [userEmail],
      subject: 'Ваш eSIM готов к активации - OneSIM',
      html: emailHtml,
    };
    console.log('📧 [EMAIL] Payload:', JSON.stringify({ ...resendPayload, html: '[HTML_CONTENT]' }));

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    });

    console.log('📧 [EMAIL] Resend HTTP Status:', resendResponse.status, resendResponse.statusText);
    const resendData = await resendResponse.json();
    console.log('📧 [EMAIL] Resend response body:', JSON.stringify(resendData, null, 2));

    if (!resendResponse.ok) {
      console.error('📧 [EMAIL] ❌ Resend API returned error status:', resendResponse.status);
      console.error('📧 [EMAIL] ❌ Error details:', JSON.stringify(resendData, null, 2));
      return { success: false, error: resendData.message || 'Failed to send email' };
    }

    console.log('📧 [EMAIL] ✅✅✅ Email sent successfully! Resend ID:', resendData.id);

    // Update email_sent status in database
    console.log('📧 [EMAIL] Updating database: setting email_sent = true...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('📧 [EMAIL] ❌ Error updating email_sent status:', updateError);
    } else {
      console.log('📧 [EMAIL] ✅ Database updated: email_sent = true');
    }

    console.log('📧 [EMAIL] ========== EMAIL SEND COMPLETED SUCCESSFULLY ==========');
    return { success: true, email: userEmail, resendId: resendData.id };
  } catch (error) {
    console.error('📧 [EMAIL] ❌❌❌ EXCEPTION CAUGHT:', error.message);
    console.error('📧 [EMAIL] Error name:', error.name);
    console.error('📧 [EMAIL] Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;
    console.log('🔍 [CHECK-STATUS] Request received for orderId:', orderId);
    console.log('🔍 [CHECK-STATUS] Environment check - RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('🔍 [CHECK-STATUS] Environment check - RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);

    if (!orderId) {
      console.error('❌ [CHECK-STATUS] Missing orderId');
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    // Get order from database
    console.log('📂 [CHECK-STATUS] Fetching order from database...');
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('❌ [CHECK-STATUS] Order not found:', fetchError);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    console.log('📂 [CHECK-STATUS] Order found:', {
      orderNo: order.order_no,
      status: order.order_status,
      emailSent: order.email_sent,
      iccid: order.iccid
    });

    // If already allocated and email sent, return current data
    if (order.order_status === 'ALLOCATED' && order.email_sent) {
      console.log('✅ [CHECK-STATUS] Already allocated and email sent, returning cached data');
      return res.json({ success: true, data: order, message: 'Already allocated and email sent' });
    }

    // If already allocated but email NOT sent, we'll query again and try to send email
    if (order.order_status === 'ALLOCATED' && !order.email_sent) {
      console.log('⚠️ [CHECK-STATUS] Order is allocated but email was not sent. Will attempt to send email now.');
    }

    // Query eSIMAccess for profile data
    console.log('📡 [CHECK-STATUS] Querying eSIMAccess for orderNo:', order.order_no);
    const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNo: order.order_no }),
    });

    const queryData = await queryResponse.json();
    console.log('📄 eSIM query response:', queryData);

    if (queryData.success && queryData.obj?.esimList?.length > 0) {
      const esim = queryData.obj.esimList[0];
      console.log('✅ [CHECK-STATUS] eSIM found:', { iccid: esim.iccid, status: esim.esimStatus });

      // Update order with eSIM data
      console.log('📝 [CHECK-STATUS] Updating order in database...');
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          order_status: 'ALLOCATED',
          iccid: esim.iccid,
          qr_code_url: esim.qrCodeUrl,
          qr_code_data: esim.ac,
          smdp_address: esim.smdpAddress,
          activation_code: esim.ac,
          esim_status: esim.esimStatus
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [CHECK-STATUS] DB update error:', updateError);
        throw updateError;
      }
      console.log('✅ [CHECK-STATUS] Order updated successfully');

      // Send email notification
      console.log('📧 [CHECK-STATUS] ========== TRIGGERING EMAIL SEND ==========');
      console.log('📧 [CHECK-STATUS] About to call sendEsimEmail with:', {
        orderId: updatedOrder.id,
        orderNo: updatedOrder.order_no,
        userId: updatedOrder.user_id,
        esimIccid: esim.iccid
      });

      const emailResult = await sendEsimEmail(updatedOrder, esim);

      console.log('📧 [CHECK-STATUS] ========== EMAIL RESULT RECEIVED ==========');
      console.log('📧 [CHECK-STATUS] Email result:', JSON.stringify(emailResult, null, 2));

      return res.json({
        success: true,
        data: updatedOrder,
        message: 'eSIM allocated successfully',
        emailSent: emailResult.success,
        emailTo: emailResult.email,
        emailError: emailResult.error || null
      });
    }

    // Not yet allocated
    console.log('⏳ [CHECK-STATUS] eSIM not yet allocated, still processing');
    return res.json({
      success: true,
      data: order,
      message: 'Still processing'
    });

  } catch (error) {
    console.error('❌ [CHECK-STATUS] FATAL ERROR:', error.message);
    console.error('❌ [CHECK-STATUS] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}
