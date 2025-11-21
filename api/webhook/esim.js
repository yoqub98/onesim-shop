// api/webhook/esim.js - Vercel serverless function for eSIMAccess webhooks
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// Simple email sending using Supabase Edge Functions or external service
async function sendEsimEmail(order, esim) {
  try {
    // Get user email from Supabase auth
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
    const userEmail = userData?.user?.email;

    if (!userEmail) {
      console.error('❌ No email found for user:', order.user_id);
      return;
    }

    // For production, integrate with your email service (SendGrid, Resend, etc.)
    // This is a placeholder - implement actual email sending
    console.log('📧 Email would be sent to:', userEmail, 'with eSIM data:', {
      orderNo: order.order_no,
      iccid: esim.iccid,
      qrCodeUrl: esim.qrCodeUrl
    });

    // Update email_sent status
    await supabase
      .from('orders')
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq('id', order.id);

    console.log('✅ Email marked as sent for:', userEmail);
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
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
    console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));

    const { orderNo, esimList, notifyType } = req.body;

    if (!orderNo) {
      return res.status(400).json({ success: false, error: 'Invalid webhook payload' });
    }

    // Find the order in database
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found for webhook:', orderNo);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // If eSIM data is in webhook, update directly
    if (esimList && esimList.length > 0) {
      const esim = esimList[0];

      const { error: updateError } = await supabase
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
        .eq('order_no', orderNo);

      if (updateError) {
        console.error('❌ Failed to update order:', updateError);
        throw updateError;
      }

      // Send email to user
      await sendEsimEmail(order, esim);

      console.log('✅ Order updated with eSIM data:', orderNo);
    } else {
      // Query eSIMAccess for profile data
      const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
        method: 'POST',
        headers: {
          'RT-AccessCode': ESIMACCESS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNo }),
      });

      const queryData = await queryResponse.json();
      console.log('📄 Queried eSIM data:', queryData);

      if (queryData.success && queryData.obj?.esimList?.length > 0) {
        const esim = queryData.obj.esimList[0];

        const { error: updateError } = await supabase
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
          .eq('order_no', orderNo);

        if (!updateError) {
          await sendEsimEmail(order, esim);
        }
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
