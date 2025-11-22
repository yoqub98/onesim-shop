// api/webhook/esim.js - Vercel serverless function for eSIMAccess webhooks
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// Send eSIM email notification via Resend
async function sendEsimEmail(order, esim) {
  console.log('📧 [WEBHOOK-EMAIL] ========== EMAIL SEND STARTING ==========');
  console.log('📧 [WEBHOOK-EMAIL] Order:', { id: order.id, user_id: order.user_id, order_no: order.order_no });
  console.log('📧 [WEBHOOK-EMAIL] eSIM:', { iccid: esim.iccid, qrCodeUrl: esim.qrCodeUrl ? 'present' : 'missing' });

  // Validate SENDGRID_API_KEY
  if (!process.env.SENDGRID_API_KEY) {
    console.error('📧 [WEBHOOK-EMAIL] ❌ CRITICAL: SENDGRID_API_KEY is not set!');
    return { success: false, error: 'SENDGRID_API_KEY not configured' };
  }
  console.log('📧 [WEBHOOK-EMAIL] ✅ SENDGRID_API_KEY configured');

  try {
    // Get user email from Supabase auth
    console.log('📧 [WEBHOOK-EMAIL] Fetching user data for:', order.user_id);
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(order.user_id);

    if (userError) {
      console.error('📧 [WEBHOOK-EMAIL] ❌ Error fetching user:', userError);
      return { success: false, error: userError.message };
    }

    const userEmail = userData?.user?.email;
    console.log('📧 [WEBHOOK-EMAIL] User email:', userEmail || '❌ NOT FOUND');

    if (!userEmail) {
      console.error('📧 [WEBHOOK-EMAIL] ❌ No email found for user:', order.user_id);
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
    console.log('📧 [WEBHOOK-EMAIL] ========== CALLING SENDGRID API ==========');
    console.log('📧 [WEBHOOK-EMAIL] Target email:', userEmail);

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
    console.log('📧 [WEBHOOK-EMAIL] SendGrid payload prepared');

    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridPayload),
    });

    console.log('📧 [WEBHOOK-EMAIL] SendGrid HTTP Status:', sendgridResponse.status, sendgridResponse.statusText);

    // SendGrid returns 202 Accepted on success (not 200)
    if (sendgridResponse.status === 202) {
      console.log('📧 [WEBHOOK-EMAIL] ✅✅✅ Email sent successfully via SendGrid!');
    } else {
      const errorData = await sendgridResponse.text();
      console.error('📧 [WEBHOOK-EMAIL] ❌ SendGrid API error:', errorData);
      return { success: false, error: errorData || 'Failed to send email' };
    }

    // Update email_sent status in database
    console.log('📧 [WEBHOOK-EMAIL] Updating database: setting email_sent = true...');
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('📧 [WEBHOOK-EMAIL] ❌ Error updating email_sent status:', updateError);
    } else {
      console.log('📧 [WEBHOOK-EMAIL] ✅ Database updated: email_sent = true');
    }

    console.log('📧 [WEBHOOK-EMAIL] ========== EMAIL SEND COMPLETED ==========');
    return { success: true, email: userEmail };
  } catch (error) {
    console.error('📧 [WEBHOOK-EMAIL] ❌❌❌ EXCEPTION:', error.message);
    console.error('📧 [WEBHOOK-EMAIL] Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request for URL validation by eSIMAccess
  if (req.method === 'GET') {
    console.log('🔍 [WEBHOOK] GET request - URL validation check');
    return res.status(200).json({
      success: true,
      message: 'OneSIM eSIM Webhook Endpoint',
      status: 'active'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('📥 [WEBHOOK] ========== WEBHOOK RECEIVED ==========');
    console.log('📥 [WEBHOOK] Full payload:', JSON.stringify(req.body, null, 2));

    const { notifyType, content } = req.body;

    // Handle CHECK_HEALTH event (test webhook from esimAccess)
    if (notifyType === 'CHECK_HEALTH') {
      console.log('✅ [WEBHOOK] CHECK_HEALTH event received - webhook endpoint is working!');
      console.log('✅ [WEBHOOK] Test content:', JSON.stringify(content, null, 2));
      return res.status(200).json({
        success: true,
        message: 'Webhook endpoint is healthy and ready to receive events'
      });
    }

    // Handle ORDER_STATUS event (real eSIM allocation)
    if (notifyType === 'ORDER_STATUS') {
      console.log('📦 [WEBHOOK] ORDER_STATUS event received');
      const { orderNo, orderStatus } = content || {};
      console.log('📦 [WEBHOOK] Order details:', { orderNo, orderStatus });

      if (!orderNo) {
        console.error('❌ [WEBHOOK] Missing orderNo in ORDER_STATUS event');
        return res.status(400).json({ success: false, error: 'Missing orderNo' });
      }

      // Only process GOT_RESOURCE status (eSIM ready)
      if (orderStatus !== 'GOT_RESOURCE') {
        console.log('⏭️ [WEBHOOK] Ignoring status:', orderStatus, '(waiting for GOT_RESOURCE)');
        return res.status(200).json({ success: true, message: 'Status noted but not GOT_RESOURCE' });
      }

      console.log('🎯 [WEBHOOK] GOT_RESOURCE status - eSIM is ready! Querying for details...');

      // Find the order in database
      console.log('📂 [WEBHOOK] Looking up order in database:', orderNo);
      const { data: order, error: findError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_no', orderNo)
        .single();

      if (findError || !order) {
        console.error('❌ [WEBHOOK] Order not found:', orderNo, findError);
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      console.log('📂 [WEBHOOK] Order found:', {
        id: order.id,
        userId: order.user_id,
        currentStatus: order.order_status,
        emailSent: order.email_sent
      });

      // Query eSIMAccess API to get full eSIM profile data
      console.log('📡 [WEBHOOK] Querying eSIMAccess for full eSIM profile...');
      const queryPayload = {
        orderNo,
        pager: {
          pageNo: 1,
          pageSize: 10
        }
      };
      console.log('📡 [WEBHOOK] Query payload:', JSON.stringify(queryPayload));

      const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
        method: 'POST',
        headers: {
          'RT-AccessCode': ESIMACCESS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryPayload),
      });

      const queryData = await queryResponse.json();
      console.log('📄 [WEBHOOK] eSIMAccess query response:', JSON.stringify(queryData, null, 2));

      if (!queryData.success || !queryData.obj?.esimList?.length) {
        console.error('❌ [WEBHOOK] Failed to query eSIM data from eSIMAccess');
        return res.status(400).json({ success: false, error: 'Failed to retrieve eSIM data' });
      }

      const esim = queryData.obj.esimList[0];
      console.log('✅ [WEBHOOK] eSIM data retrieved:', {
        iccid: esim.iccid,
        esimStatus: esim.esimStatus,
        hasQrCode: !!esim.qrCodeUrl
      });

      // Update order in database
      console.log('💾 [WEBHOOK] Updating order in database...');
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
        .eq('order_no', orderNo)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [WEBHOOK] Database update failed:', updateError);
        throw updateError;
      }

      console.log('✅ [WEBHOOK] Order updated successfully');

      // Send email to user
      console.log('📧 [WEBHOOK] Triggering email send...');
      const emailResult = await sendEsimEmail(updatedOrder || order, esim);
      console.log('📧 [WEBHOOK] Email result:', emailResult);

      console.log('🎉 [WEBHOOK] Webhook processing complete!');
      return res.status(200).json({
        success: true,
        message: 'eSIM allocated and email sent',
        emailSent: emailResult.success
      });
    }

    // Unknown event type
    console.log('⚠️ [WEBHOOK] Unknown notifyType:', notifyType);
    return res.status(200).json({ success: true, message: 'Event type not handled' });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
