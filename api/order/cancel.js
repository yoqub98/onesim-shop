// api/order/cancel.js - Cancel eSIM and get refund
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
    const { orderId, userId } = req.body;
    console.log('🚫 [CANCEL] Cancel request received:', { orderId, userId });

    if (!orderId || !userId) {
      console.error('❌ [CANCEL] Missing required fields');
      return res.status(400).json({ success: false, error: 'orderId and userId are required' });
    }

    // Get order from database
    console.log('📂 [CANCEL] Fetching order from database...');
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      console.error('❌ [CANCEL] Order not found:', fetchError);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    console.log('📂 [CANCEL] Order found:', {
      orderNo: order.order_no,
      status: order.order_status,
      iccid: order.iccid,
      esimStatus: order.esim_status
    });

    // Check if order can be cancelled
    if (order.order_status === 'CANCELLED') {
      console.log('⚠️ [CANCEL] Order already cancelled');
      return res.status(400).json({ success: false, error: 'Order is already cancelled' });
    }

    if (order.order_status !== 'ALLOCATED') {
      console.log('⚠️ [CANCEL] Order not in ALLOCATED status, cannot cancel');
      return res.status(400).json({ success: false, error: 'Only allocated eSIMs can be cancelled' });
    }

    // First, query eSIMAccess to get the esimTranNo and current status
    console.log('📡 [CANCEL] Querying eSIMAccess for current eSIM status...');
    const queryPayload = {
      orderNo: order.order_no,
      pager: {
        pageNo: 1,
        pageSize: 10
      }
    };
    console.log('📡 [CANCEL] Query payload:', JSON.stringify(queryPayload));

    const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    const queryData = await queryResponse.json();
    console.log('📄 [CANCEL] eSIMAccess query response:', JSON.stringify(queryData));

    if (!queryData.success || !queryData.obj?.esimList?.length) {
      console.error('❌ [CANCEL] Failed to get eSIM details from eSIMAccess');
      return res.status(400).json({ success: false, error: 'Could not retrieve eSIM details' });
    }

    const esim = queryData.obj.esimList[0];
    console.log('📄 [CANCEL] eSIM details:', {
      esimTranNo: esim.esimTranNo,
      esimStatus: esim.esimStatus,
      smdpStatus: esim.smdpStatus,
      iccid: esim.iccid
    });

    // Check if eSIM can be cancelled (must be GOT_RESOURCE and RELEASED)
    if (esim.esimStatus !== 'GOT_RESOURCE') {
      console.log('⚠️ [CANCEL] eSIM status is not GOT_RESOURCE:', esim.esimStatus);
      return res.status(400).json({
        success: false,
        error: `eSIM cannot be cancelled. Current status: ${esim.esimStatus}. Only unused eSIMs can be cancelled.`
      });
    }

    if (esim.smdpStatus && esim.smdpStatus !== 'RELEASED') {
      console.log('⚠️ [CANCEL] eSIM smdpStatus is not RELEASED:', esim.smdpStatus);
      return res.status(400).json({
        success: false,
        error: `eSIM has been installed or activated. Status: ${esim.smdpStatus}. Cannot cancel.`
      });
    }

    // Cancel the eSIM via eSIMAccess
    console.log('🚫 [CANCEL] Sending cancel request to eSIMAccess...');
    console.log('🚫 [CANCEL] Using esimTranNo:', esim.esimTranNo);

    const cancelResponse = await fetch(`${ESIMACCESS_API_URL}/esim/cancel`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ esimTranNo: esim.esimTranNo }),
    });

    const cancelData = await cancelResponse.json();
    console.log('📬 [CANCEL] eSIMAccess cancel response:', JSON.stringify(cancelData));

    if (!cancelData.success) {
      console.error('❌ [CANCEL] eSIMAccess cancel failed:', cancelData.errorMsg);
      return res.status(400).json({
        success: false,
        error: cancelData.errorMsg || 'Failed to cancel eSIM'
      });
    }

    // Update order status in database
    console.log('💾 [CANCEL] Updating order status to CANCELLED...');
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        order_status: 'CANCELLED',
        esim_status: 'CANCELLED',
        error_message: 'Cancelled by user'
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [CANCEL] Database update error:', updateError);
      // Even if DB update fails, the eSIM was cancelled in eSIMAccess
    } else {
      console.log('✅ [CANCEL] Database updated successfully');
    }

    console.log('🎉 [CANCEL] eSIM cancelled successfully!');
    return res.json({
      success: true,
      message: 'eSIM cancelled successfully. Refund has been credited to balance.',
      data: updatedOrder || order
    });

  } catch (error) {
    console.error('❌ [CANCEL] FATAL ERROR:', error.message);
    console.error('❌ [CANCEL] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}
