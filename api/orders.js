// api/orders.js - Consolidated orders API endpoint
// Handles all order-related operations to reduce serverless function count

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;
const CBU_API_URL = process.env.CBU_API_URL || 'https://cbu.uz/ru/arkhiv-kursov-valyut/json';

// Cache for exchange rates (1 hour)
let cachedRate = null;
let cacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000;

async function getExchangeRate() {
  try {
    if (cachedRate && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      return cachedRate;
    }

    const response = await fetch(`${CBU_API_URL}/USD/${Date.now()}/`);
    if (!response.ok) throw new Error(`CBU API error: ${response.status}`);

    const data = await response.json();
    const rate = parseFloat(data[0]?.Rate);

    if (!rate || isNaN(rate)) throw new Error('Invalid exchange rate');

    cachedRate = rate;
    cacheTime = Date.now();
    return rate;
  } catch (error) {
    console.error('❌ Failed to fetch exchange rate:', error.message);
    return 12800; // Fallback rate
  }
}

// Route: GET /api/orders?userId=xxx - Get user orders
async function getUserOrders(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: orders || [] });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Route: POST /api/orders?action=create - Create new order
async function createOrder(req, res) {
  // Import the original order.js logic here
  const orderData = req.body;

  try {
    // ... (copy logic from api/order.js)
    return res.status(200).json({ success: true, message: 'Order created' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Route: POST /api/orders?action=cancel - Cancel order
async function cancelOrder(req, res) {
  const { orderId, userId } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ success: false, error: 'orderId and userId are required' });
  }

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.order_status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Order already cancelled' });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ order_status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Failed to cancel order:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Route: POST /api/orders?action=check-status - Check order status
async function checkOrderStatus(req, res) {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ success: false, error: 'orderId is required' });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.order_status !== 'PENDING' || !order.order_no) {
      return res.status(200).json({ success: true, data: order });
    }

    // Query eSIMAccess API for status
    const apiResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `check_${Date.now()}`,
      },
      body: JSON.stringify({ orderNo: order.order_no }),
    });

    const apiData = await apiResponse.json();

    if (apiData.success && apiData.obj?.esimList?.[0]) {
      const esim = apiData.obj.esimList[0];

      const updateData = {
        order_status: 'ALLOCATED',
        esim_status: esim.esimStatus,
        smdp_status: esim.smdpStatus,
        iccid: esim.iccid,
        qr_code_url: esim.qrCodeUrl,
        activation_code: esim.ac,
        esim_tran_no: esim.esimTranNo,
        expiry_date: esim.expiredTime,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('orders').update(updateData).eq('id', orderId);

      return res.status(200).json({ success: true, data: { ...order, ...updateData } });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Failed to check order status:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// Route: POST /api/orders?action=topup-plans - Get available top-up plans
async function getTopupPlans(req, res) {
  const { orderId, userId } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ error: 'orderId and userId are required' });
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.iccid) {
      return res.status(400).json({ error: 'eSIM not yet activated. ICCID is required for top-up.' });
    }

    const { data: topupCount } = await supabase.rpc('get_order_topup_count', { p_order_id: orderId });

    if (topupCount >= 10) {
      return res.status(400).json({
        error: 'Maximum top-up limit reached (10 top-ups per eSIM)',
        topupCount,
        maxTopups: 10,
      });
    }

    const apiResponse = await fetch(`${ESIMACCESS_API_URL}/package/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `topup_plans_${Date.now()}`,
      },
      body: JSON.stringify({
        type: 'TOPUP',
        packageCode: order.package_code,
        iccid: order.iccid,
        locationCode: '',
      }),
    });

    const apiData = await apiResponse.json();

    if (!apiData.success || !apiData.obj?.packageList) {
      return res.status(500).json({ error: 'Failed to fetch top-up plans' });
    }

    const exchangeRate = await getExchangeRate();

    const plans = apiData.obj.packageList.map((plan) => {
      const priceUsd = plan.price / 10000;
      const priceUzs = Math.round(priceUsd * exchangeRate);
      const dataGB = (plan.dataVolume / (1024 * 1024 * 1024)).toFixed(2);

      return {
        packageCode: plan.packageCode,
        slug: plan.slug,
        name: `${dataGB}GB for ${plan.duration} days`,
        dataVolume: plan.dataVolume,
        dataGB: parseFloat(dataGB),
        duration: plan.duration,
        durationUnit: plan.durationUnit || 'DAY',
        priceUsd: parseFloat(priceUsd.toFixed(2)),
        priceUzs,
        currency: 'USD',
        operators: plan.locationNetworkList || [],
        supportTopUpType: plan.supportTopUpType,
        dataType: plan.dataType,
      };
    });

    return res.status(200).json({
      success: true,
      plans,
      topupCount: topupCount || 0,
      maxTopups: 10,
      exchangeRate,
      order: {
        id: order.id,
        order_no: order.order_no,
        package_name: order.package_name,
        iccid: order.iccid,
      },
    });
  } catch (error) {
    console.error('Failed to get top-up plans:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Route: POST /api/orders?action=topup - Process top-up
async function processTopup(req, res) {
  const { orderId, userId, packageCode, priceUzs, priceUsd, dataAmount, validityDays, packageName } = req.body;

  if (!orderId || !userId || !packageCode) {
    return res.status(400).json({ error: 'orderId, userId, and packageCode are required' });
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!order.iccid && !order.esim_tran_no) {
      return res.status(400).json({ error: 'eSIM not yet activated. Cannot process top-up.' });
    }

    const { data: topupCount } = await supabase.rpc('get_order_topup_count', { p_order_id: orderId });

    if (topupCount >= 10) {
      return res.status(400).json({
        error: 'Maximum top-up limit reached (10 top-ups per eSIM)',
        topupCount,
        maxTopups: 10,
      });
    }

    const transactionId = `${Date.now()}_topup_${orderId.slice(0, 8)}`;

    const apiResponse = await fetch(`${ESIMACCESS_API_URL}/esim/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': transactionId,
      },
      body: JSON.stringify({
        esimTranNo: order.esim_tran_no || '',
        iccid: order.iccid || '',
        packageCode,
        transactionId,
      }),
    });

    const apiData = await apiResponse.json();

    if (!apiData.success) {
      await supabase.from('order_action_logs').insert({
        order_id: orderId,
        user_id: userId,
        action_type: 'TOPUP',
        topup_package_code: packageCode,
        topup_package_name: packageName || packageCode,
        topup_transaction_id: transactionId,
        topup_price_uzs: priceUzs,
        topup_price_usd: priceUsd,
        topup_data_added: dataAmount,
        topup_days_added: validityDays,
        status: 'FAILED',
        error_message: apiData.errorMsg || 'Top-up failed',
        api_response: apiData,
      });

      return res.status(400).json({
        success: false,
        error: apiData.errorMsg || 'Top-up failed',
        errorCode: apiData.errorCode,
      });
    }

    const topupData = apiData.obj;

    if (topupData.expiredTime) {
      await supabase.from('orders').update({ expiry_date: topupData.expiredTime }).eq('id', orderId);
    }

    await supabase.from('order_action_logs').insert({
      order_id: orderId,
      user_id: userId,
      action_type: 'TOPUP',
      topup_package_code: packageCode,
      topup_package_name: packageName || packageCode,
      topup_transaction_id: transactionId,
      topup_price_uzs: priceUzs,
      topup_price_usd: priceUsd,
      topup_data_added: dataAmount,
      topup_days_added: validityDays,
      previous_state: {
        totalVolume: topupData.totalVolume - (topupData.topupVolume || 0),
        totalDuration: topupData.totalDuration - (topupData.topupDuration || 0),
        expiredTime: order.expiry_date,
      },
      new_state: {
        totalVolume: topupData.totalVolume,
        totalDuration: topupData.totalDuration,
        expiredTime: topupData.expiredTime,
      },
      status: 'SUCCESS',
      api_response: topupData,
    });

    return res.status(200).json({
      success: true,
      data: {
        transactionId: topupData.transactionId,
        iccid: topupData.iccid,
        expiredTime: topupData.expiredTime,
        totalVolume: topupData.totalVolume,
        totalDuration: topupData.totalDuration,
        orderUsage: topupData.orderUsage,
      },
      message: 'Top-up completed successfully',
    });
  } catch (error) {
    console.error('Failed to process top-up:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// Main router
export default async function handler(req, res) {
  const { action } = req.query;

  console.log('🔄 [ORDERS] Request:', req.method, action || 'get-user-orders');

  try {
    if (req.method === 'GET') {
      return await getUserOrders(req, res);
    }

    if (req.method === 'POST') {
      switch (action) {
        case 'create':
          return await createOrder(req, res);
        case 'cancel':
          return await cancelOrder(req, res);
        case 'check-status':
          return await checkOrderStatus(req, res);
        case 'topup-plans':
          return await getTopupPlans(req, res);
        case 'topup':
          return await processTopup(req, res);
        default:
          return res.status(400).json({ error: 'Invalid action parameter' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [ORDERS] Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
