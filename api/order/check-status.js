// api/order/check-status.js - Poll eSIMAccess for order status and update DB
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// NOTE: Email sending temporarily disabled until domain is ready
// This function is kept for future use
async function sendEsimEmail_DISABLED(order, esim) {
  console.log('📧 [EMAIL] ========== EMAIL SEND STARTING ==========');
  console.log('📧 [EMAIL] Order:', { id: order.id, user_id: order.user_id, order_no: order.order_no });
  console.log('📧 [EMAIL] eSIM:', { iccid: esim.iccid, qrCodeUrl: esim.qrCodeUrl ? 'present' : 'missing' });

  // Validate SENDGRID_API_KEY
  if (!process.env.SENDGRID_API_KEY) {
    console.error('📧 [EMAIL] ❌ CRITICAL: SENDGRID_API_KEY is not set in environment variables!');
    return { success: false, error: 'SENDGRID_API_KEY not configured' };
  }
  console.log('📧 [EMAIL] ✅ SENDGRID_API_KEY is configured (length:', process.env.SENDGRID_API_KEY.length, ')');

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

    // Send email via SendGrid
    console.log('📧 [EMAIL] ========== CALLING SENDGRID API ==========');
    console.log('📧 [EMAIL] Target email:', userEmail);
    console.log('📧 [EMAIL] SendGrid URL: https://api.sendgrid.com/v3/mail/send');

    const sendgridPayload = {
      personalizations: [
        {
          to: [{ email: userEmail }]
        }
      ],
      from: {
        email: 'noreply@sendgrid.net',
        name: 'OneSIM'
      },
      subject: 'Ваш eSIM готов к активации - OneSIM',
      content: [
        {
          type: 'text/html',
          value: emailHtml
        }
      ]
    };
    console.log('📧 [EMAIL] SendGrid payload prepared (to:', userEmail, ')');

    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridPayload),
    });

    console.log('📧 [EMAIL] SendGrid HTTP Status:', sendgridResponse.status, sendgridResponse.statusText);

    // SendGrid returns 202 Accepted on success (not 200)
    if (sendgridResponse.status !== 202) {
      const errorData = await sendgridResponse.text();
      console.error('📧 [EMAIL] ❌ SendGrid API returned error status:', sendgridResponse.status);
      console.error('📧 [EMAIL] ❌ Error details:', errorData);
      return { success: false, error: errorData || 'Failed to send email' };
    }

    console.log('📧 [EMAIL] ✅✅✅ Email sent successfully via SendGrid!');

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
    return { success: true, email: userEmail };
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

    // Always query eSIMAccess to get the latest eSIM status (even if already allocated)
    // This ensures we update the esim_status field (NOT_ACTIVATED, ACTIVATED, USED, etc.)
    console.log('📡 [CHECK-STATUS] ========== QUERYING ESIMACCESS API ==========');
    console.log('📡 [CHECK-STATUS] Order Number:', order.order_no);
    console.log('📡 [CHECK-STATUS] Current DB Status:', order.order_status);
    console.log('📡 [CHECK-STATUS] Current ICCID:', order.iccid || 'NOT SET');

    const queryPayload = {
      orderNo: order.order_no,
      iccid: '',  // Empty to search by orderNo
      pager: {
        pageNum: 1,  // Changed from pageNo to pageNum to match API docs
        pageSize: 50
      }
    };
    console.log('📡 [CHECK-STATUS] API Request:', JSON.stringify(queryPayload, null, 2));
    console.log('📡 [CHECK-STATUS] API URL:', `${ESIMACCESS_API_URL}/esim/query`);

    const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    console.log('📡 [CHECK-STATUS] API Response Status:', queryResponse.status, queryResponse.statusText);

    const queryData = await queryResponse.json();
    console.log('📄 [CHECK-STATUS] ========== API RESPONSE ==========');
    console.log('📄 [CHECK-STATUS] Success:', queryData.success);
    console.log('📄 [CHECK-STATUS] Error Code:', queryData.errorCode);
    console.log('📄 [CHECK-STATUS] Error Message:', queryData.errorMsg);
    console.log('📄 [CHECK-STATUS] eSIM List Count:', queryData.obj?.esimList?.length || 0);
    if (queryData.obj?.esimList?.length > 0) {
      const esim = queryData.obj.esimList[0];
      console.log('📄 [CHECK-STATUS] First eSIM:', JSON.stringify({
        iccid: esim.iccid,
        esimStatus: esim.esimStatus,
        smdpStatus: esim.smdpStatus,
        qrCodeUrl: esim.qrCodeUrl ? 'PRESENT' : 'MISSING',
        shortUrl: esim.shortUrl ? 'PRESENT' : 'MISSING',
        ac: esim.ac ? 'PRESENT' : 'MISSING'
      }, null, 2));
    }

    if (queryData.success && queryData.obj?.esimList?.length > 0) {
      const esim = queryData.obj.esimList[0];
      console.log('✅ [CHECK-STATUS] ========== eSIM FOUND ==========');
      console.log('✅ [CHECK-STATUS] ICCID:', esim.iccid);
      console.log('✅ [CHECK-STATUS] eSIM Status:', esim.esimStatus);
      console.log('✅ [CHECK-STATUS] SMDP Status:', esim.smdpStatus);

      // Prepare update data - ONLY save profile data, NOT usage
      // Usage will be fetched separately in real-time from the API
      const updateData = {
        order_status: 'ALLOCATED',
        iccid: esim.iccid,
        esim_tran_no: esim.esimTranNo || null,  // Save esimTranNo for future usage queries
        qr_code_url: esim.qrCodeUrl || null,
        qr_code_data: esim.ac || null,
        smdp_address: esim.smdpAddress || null,
        activation_code: esim.ac || null,
        short_url: esim.shortUrl || null,
        esim_status: esim.esimStatus || null,
        smdp_status: esim.smdpStatus || null,
        updated_at: new Date().toISOString()
      };

      console.log('📝 [CHECK-STATUS] ========== UPDATING DATABASE ==========');
      console.log('📝 [CHECK-STATUS] Update Data:', JSON.stringify({
        ...updateData,
        qr_code_url: updateData.qr_code_url ? 'PRESENT' : 'MISSING',
        short_url: updateData.short_url ? 'PRESENT' : 'MISSING',
        activation_code: updateData.activation_code ? 'PRESENT' : 'MISSING',
        qr_code_data: updateData.qr_code_data ? 'PRESENT' : 'MISSING'
      }, null, 2));

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [CHECK-STATUS] ========== DB UPDATE FAILED ==========');
        console.error('❌ [CHECK-STATUS] Error:', updateError);
        throw updateError;
      }

      console.log('✅ [CHECK-STATUS] ========== ORDER UPDATED SUCCESSFULLY ==========');
      console.log('✅ [CHECK-STATUS] Order ID:', updatedOrder.id);
      console.log('✅ [CHECK-STATUS] ICCID:', updatedOrder.iccid);
      console.log('✅ [CHECK-STATUS] QR Code URL:', updatedOrder.qr_code_url ? 'SET' : 'NOT SET');
      console.log('✅ [CHECK-STATUS] Short URL:', updatedOrder.short_url ? 'SET' : 'NOT SET');
      console.log('ℹ️ [CHECK-STATUS] Email sending skipped - users will access QR code via My eSIMs page');

      return res.json({
        success: true,
        data: updatedOrder,
        message: 'eSIM allocated successfully. QR code available in My eSIMs page.'
      });
    }

    // Not yet allocated
    console.log('⏳ [CHECK-STATUS] ========== eSIM NOT YET READY ==========');
    console.log('⏳ [CHECK-STATUS] API returned success but no eSIM data');
    console.log('⏳ [CHECK-STATUS] Order is still being processed');
    return res.json({
      success: true,
      data: order,
      message: 'eSIM is still being processed. Please try again in a few moments.'
    });

  } catch (error) {
    console.error('❌ [CHECK-STATUS] FATAL ERROR:', error.message);
    console.error('❌ [CHECK-STATUS] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}
