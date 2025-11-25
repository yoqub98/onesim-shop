// api/webhook/esim.js - Vercel serverless function for eSIMAccess webhooks
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// NOTE: Email sending temporarily disabled until domain is ready
// Orders are saved to database and users can access QR codes via "My eSIMs" page

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
      console.log('📡 [WEBHOOK] ========== QUERYING ESIMACCESS API ==========');
      console.log('📡 [WEBHOOK] Order Number:', orderNo);
      const queryPayload = {
        orderNo,
        iccid: '',
        pager: {
          pageNum: 1,  // Fixed: was pageNo, should be pageNum
          pageSize: 50
        }
      };
      console.log('📡 [WEBHOOK] Query payload:', JSON.stringify(queryPayload, null, 2));

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
      console.log('✅ [WEBHOOK] ========== eSIM DATA RETRIEVED ==========');
      console.log('✅ [WEBHOOK] ICCID:', esim.iccid);
      console.log('✅ [WEBHOOK] eSIM Status:', esim.esimStatus);
      console.log('✅ [WEBHOOK] SMDP Status:', esim.smdpStatus);
      console.log('✅ [WEBHOOK] QR Code URL:', esim.qrCodeUrl ? 'PRESENT' : 'MISSING');
      console.log('✅ [WEBHOOK] Short URL:', esim.shortUrl ? 'PRESENT' : 'MISSING');
      console.log('✅ [WEBHOOK] Activation Code:', esim.ac ? 'PRESENT' : 'MISSING');

      // Prepare update data - ONLY save profile data, NOT usage
      // Usage will be fetched separately in real-time from the API using orderNo
      const updateData = {
        order_status: 'ALLOCATED',
        iccid: esim.iccid,
        qr_code_url: esim.qrCodeUrl || null,
        qr_code_data: esim.ac || null,
        smdp_address: esim.smdpAddress || null,
        activation_code: esim.ac || null,
        short_url: esim.shortUrl || null,
        esim_status: esim.esimStatus || null,
        smdp_status: esim.smdpStatus || null,
        updated_at: new Date().toISOString()
      };

      console.log('💾 [WEBHOOK] ========== UPDATING DATABASE ==========');
      console.log('💾 [WEBHOOK] Update Data:', JSON.stringify({
        ...updateData,
        qr_code_url: updateData.qr_code_url ? 'SET' : 'NOT SET',
        short_url: updateData.short_url ? 'SET' : 'NOT SET',
        activation_code: updateData.activation_code ? 'SET' : 'NOT SET'
      }, null, 2));

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('order_no', orderNo)
        .select()
        .single();

      if (updateError) {
        console.error('❌ [WEBHOOK] Database update failed:', updateError);
        throw updateError;
      }

      console.log('✅ [WEBHOOK] Order updated successfully');
      console.log('ℹ️ [WEBHOOK] Email sending skipped - users will access QR code via My eSIMs page');

      console.log('🎉 [WEBHOOK] Webhook processing complete!');
      return res.status(200).json({
        success: true,
        message: 'eSIM allocated successfully. User can access QR code in My eSIMs page.'
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
