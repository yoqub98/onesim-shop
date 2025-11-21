// api/order/check-status.js - Poll eSIMAccess for order status and update DB
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

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

    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId is required' });
    }

    // Get order from database
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // If already allocated, return current data
    if (order.order_status === 'ALLOCATED') {
      return res.json({ success: true, data: order, message: 'Already allocated' });
    }

    // Query eSIMAccess for profile data
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

      // Update order with eSIM data
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
        throw updateError;
      }

      return res.json({
        success: true,
        data: updatedOrder,
        message: 'eSIM allocated successfully'
      });
    }

    // Not yet allocated
    return res.json({
      success: true,
      data: order,
      message: 'Still processing'
    });

  } catch (error) {
    console.error('❌ Check status error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}
