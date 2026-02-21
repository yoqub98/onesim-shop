// api/orders.js - Consolidated orders API endpoint
// Handles all order-related operations to reduce serverless function count

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.ESIMACCESS_API_KEY || process.env.REACT_APP_ESIMACCESS_API_KEY;
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

// Route: GET /api/orders?userId=xxx&live=true - Get user orders
async function getUserOrders(req, res) {
  const { userId, live } = req.query;

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

    // If live=true, fetch live status from eSIM Access API for allocated orders
    if (live === 'true' && orders && orders.length > 0) {
      console.log('📡 [GET-ORDERS] Fetching live status for', orders.length, 'orders');

      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          // Only query live status for orders with order_no (allocated orders)
          if (!order.order_no || order.order_status === 'CANCELLED') {
            return order;
          }

          try {
            console.log('📡 [GET-ORDERS] Querying live status for order:', order.order_no);

            // Query eSIM Access API for live status
            const apiResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'RT-AccessCode': ESIMACCESS_API_KEY,
                'RT-RequestID': `live_status_${Date.now()}_${order.id}`,
              },
              body: JSON.stringify({
                orderNo: order.order_no,
                pager: { pageNum: 1, pageSize: 1 }
              }),
            });

            const apiData = await apiResponse.json();

            if (apiData.success && apiData.obj?.esimList?.[0]) {
              const esim = apiData.obj.esimList[0];

              console.log('✅ [GET-ORDERS] Live status received:', {
                orderNo: order.order_no,
                esimStatus: esim.esimStatus,
                smdpStatus: esim.smdpStatus,
                orderUsage: esim.orderUsage,
                totalVolume: esim.totalVolume,
              });

              // Update data in Supabase
              const updateData = {
                esim_status: esim.esimStatus,
                smdp_status: esim.smdpStatus,
                iccid: esim.iccid,
                order_usage: esim.orderUsage,
                total_volume: esim.totalVolume,
                total_duration: esim.totalDuration,
                activation_date: esim.activateTime,
                installation_date: esim.installationTime,
                expiry_date: esim.expiredTime,
                esim_tran_no: esim.esimTranNo,
                updated_at: new Date().toISOString(),
              };

              // Only update order_status if it's still PENDING
              if (order.order_status === 'PENDING') {
                updateData.order_status = 'ALLOCATED';
              }

              // Update in database
              await supabase
                .from('orders')
                .update(updateData)
                .eq('id', order.id);

              // Return updated order object
              return { ...order, ...updateData };
            }

            // If API call failed or no data, return original order
            console.log('⚠️ [GET-ORDERS] No live data for order:', order.order_no);
            return order;

          } catch (apiError) {
            console.error('❌ [GET-ORDERS] Failed to fetch live status for order:', order.order_no, apiError);
            // Return original order if API call fails
            return order;
          }
        })
      );

      console.log('✅ [GET-ORDERS] Live status update complete');
      return res.status(200).json({ success: true, data: updatedOrders || [] });
    }

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
        'RT-AccessCode': ESIMACCESS_API_KEY,
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
    return res.status(400).json({ success: false, error: 'orderId and userId are required' });
  }

  try {
    console.log('💳 [TOPUP-PLANS] Fetching order:', { orderId, userId });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      console.error('💳 [TOPUP-PLANS] Order not found:', orderError);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    console.log('💳 [TOPUP-PLANS] Order found:', {
      id: order.id,
      package_code: order.package_code,
      iccid: order.iccid,
      esim_status: order.esim_status,
    });

    if (!order.iccid) {
      console.error('💳 [TOPUP-PLANS] No ICCID found for order');
      return res.status(400).json({ success: false, error: 'eSIM not yet activated. ICCID is required for top-up.' });
    }

    const { data: topupCount, error: rpcError } = await supabase.rpc('get_order_topup_count', { p_order_id: orderId });

    if (rpcError) {
      console.error('💳 [TOPUP-PLANS] RPC error:', rpcError);
      return res.status(500).json({ success: false, error: 'Failed to get top-up count', details: rpcError.message });
    }

    console.log('💳 [TOPUP-PLANS] Current top-up count:', topupCount);

    if (topupCount >= 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum top-up limit reached (10 top-ups per eSIM)',
        topupCount,
        maxTopups: 10,
      });
    }

    console.log('💳 [TOPUP-PLANS] Calling eSIMAccess API with:', {
      type: 'TOPUP',
      packageCode: order.package_code,
      iccid: order.iccid,
    });

    const apiResponse = await fetch(`${ESIMACCESS_API_URL}/package/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'RT-RequestID': `topup_plans_${Date.now()}`,
      },
      body: JSON.stringify({
        type: 'TOPUP',
        packageCode: order.package_code,
        iccid: order.iccid,
        locationCode: '',
      }),
    });

    console.log('💳 [TOPUP-PLANS] API response status:', apiResponse.status);

    const apiData = await apiResponse.json();

    console.log('💳 [TOPUP-PLANS] API response data:', {
      success: apiData.success,
      errorCode: apiData.errorCode,
      errorMsg: apiData.errorMsg,
      hasPackageList: !!apiData.obj?.packageList,
      packageCount: apiData.obj?.packageList?.length || 0,
    });

    if (!apiData.success || !apiData.obj?.packageList) {
      console.error('💳 [TOPUP-PLANS] API returned error:', {
        success: apiData.success,
        errorCode: apiData.errorCode,
        errorMsg: apiData.errorMsg,
        fullResponse: apiData,
      });
      return res.status(500).json({
        success: false,
        error: apiData.errorMsg || 'Failed to fetch top-up plans from eSIMAccess',
        errorCode: apiData.errorCode,
        details: apiData,
      });
    }

    const exchangeRate = await getExchangeRate();

    console.log('💳 [TOPUP-PLANS] Sample plan from API:', JSON.stringify(apiData.obj.packageList[0], null, 2));

    const plans = apiData.obj.packageList.map((plan) => {
      // Price is in cents (10000 = $1.00)
      const priceUsd = plan.price / 10000;
      const priceUzs = Math.round(priceUsd * exchangeRate);

      // Check for volume field (from actual API response)
      // volume is in bytes (1073741824 = 1GB)
      let dataGB = 0;
      const volumeField = plan.volume || plan.dataVolume;

      if (volumeField && volumeField > 0) {
        // Convert bytes to GB
        dataGB = (volumeField / (1024 * 1024 * 1024)).toFixed(2);
      }

      console.log('💳 [TOPUP-PLANS] Plan transformation:', {
        packageCode: plan.packageCode,
        packageName: plan.packageName,
        rawVolume: plan.volume,
        rawDataVolume: plan.dataVolume,
        calculatedGB: dataGB,
        duration: plan.duration,
        price: plan.price,
        priceUsd,
        priceUzs,
      });

      return {
        packageCode: plan.packageCode,
        slug: plan.slug,
        name: plan.packageName || `${dataGB}GB for ${plan.duration} days`,
        dataVolume: volumeField,
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

    console.log('💳 [TOPUP-PLANS] Returning plans:', { planCount: plans.length, topupCount: topupCount || 0 });

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
    console.error('💳 [TOPUP-PLANS] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

// Route: POST /api/orders?action=topup - Process top-up
async function processTopup(req, res) {
  const { orderId, userId, packageCode, priceUzs, priceUsd, dataAmount, validityDays, packageName } = req.body;

  if (!orderId || !userId || !packageCode) {
    return res.status(400).json({ success: false, error: 'orderId, userId, and packageCode are required' });
  }

  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!order.iccid && !order.esim_tran_no) {
      return res.status(400).json({ success: false, error: 'eSIM not yet activated. Cannot process top-up.' });
    }

    const { data: topupCount, error: rpcError } = await supabase.rpc('get_order_topup_count', { p_order_id: orderId });

    if (rpcError) {
      console.error('💳 [TOPUP] RPC error:', rpcError);
      return res.status(500).json({ success: false, error: 'Failed to get top-up count', details: rpcError.message });
    }

    if (topupCount >= 10) {
      return res.status(400).json({
        success: false,
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
        'RT-AccessCode': ESIMACCESS_API_KEY,
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
    console.error('💳 [TOPUP] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

// Main router
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
          return res.status(400).json({ success: false, error: 'Invalid action parameter' });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [ORDERS] Unexpected error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
