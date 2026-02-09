// api/order/topup.js - Process eSIM top-up
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

export default async function handler(req, res) {
  console.log('🔄 [TOPUP] ========== PROCESS TOP-UP REQUEST ==========');
  console.log('🔄 [TOPUP] Method:', req.method);

  if (req.method !== 'POST') {
    console.log('❌ [TOPUP] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, userId, packageCode, priceUzs, priceUsd, dataAmount, validityDays, packageName } = req.body;

    console.log('📊 [TOPUP] Request data:', {
      orderId,
      userId,
      packageCode,
      priceUzs,
      priceUsd,
      dataAmount,
      validityDays,
      packageName,
    });

    // Validate required fields
    if (!orderId || !userId || !packageCode) {
      console.log('❌ [TOPUP] Missing required fields');
      return res.status(400).json({ error: 'orderId, userId, and packageCode are required' });
    }

    // 1. Fetch order from database
    console.log('🔍 [TOPUP] Fetching order from database...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      console.error('❌ [TOPUP] Order not found:', orderError);
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('✅ [TOPUP] Order found:', {
      order_no: order.order_no,
      package_code: order.package_code,
      iccid: order.iccid,
      esim_tran_no: order.esim_tran_no,
    });

    // 2. Validate order has ICCID or esimTranNo
    if (!order.iccid && !order.esim_tran_no) {
      console.log('❌ [TOPUP] Order does not have ICCID or esimTranNo');
      return res.status(400).json({ error: 'eSIM not yet activated. Cannot process top-up.' });
    }

    // 3. Check top-up count limit (max 10 top-ups)
    console.log('🔍 [TOPUP] Checking top-up count...');
    const { data: topupCount, error: countError } = await supabase.rpc('get_order_topup_count', {
      p_order_id: orderId,
    });

    if (countError) {
      console.error('❌ [TOPUP] Error checking top-up count:', countError);
    } else {
      console.log('📊 [TOPUP] Current top-up count:', topupCount);
      if (topupCount >= 10) {
        console.log('❌ [TOPUP] Maximum top-up limit reached');
        return res.status(400).json({
          error: 'Maximum top-up limit reached (10 top-ups per eSIM)',
          topupCount,
          maxTopups: 10
        });
      }
    }

    // 4. Generate unique transaction ID
    const transactionId = `${Date.now()}_topup_${orderId.slice(0, 8)}`;
    console.log('🆔 [TOPUP] Transaction ID:', transactionId);

    // 5. Call eSIMAccess API to process top-up
    console.log('🌐 [TOPUP] Calling eSIMAccess API...');
    const apiRequestBody = {
      esimTranNo: order.esim_tran_no || '',
      iccid: order.iccid || '',
      packageCode,
      transactionId,
    };

    console.log('📤 [TOPUP] API Request:', apiRequestBody);

    const apiResponse = await fetch(`${ESIMACCESS_API_URL}/esim/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': transactionId,
      },
      body: JSON.stringify(apiRequestBody),
    });

    if (!apiResponse.ok) {
      console.error('❌ [TOPUP] eSIMAccess API error:', apiResponse.status);
      throw new Error(`eSIMAccess API error: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    console.log('📥 [TOPUP] API Response:', JSON.stringify(apiData, null, 2));

    if (!apiData.success) {
      console.error('❌ [TOPUP] Top-up failed:', apiData.errorMsg || apiData.errorCode);

      // Log failed top-up attempt
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
    console.log('✅ [TOPUP] Top-up successful:', topupData);

    // 6. Update order with new data
    console.log('💾 [TOPUP] Updating order in database...');
    const updateData = {};

    // Only update expiry_date if we have expiredTime in response
    if (topupData.expiredTime) {
      updateData.expiry_date = topupData.expiredTime;
    }

    // Update order if there's data to update
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) {
        console.error('❌ [TOPUP] Failed to update order:', updateError);
      } else {
        console.log('✅ [TOPUP] Order updated successfully');
      }
    }

    // 7. Log the top-up action
    console.log('📝 [TOPUP] Logging top-up action...');
    const { error: logError } = await supabase.from('order_action_logs').insert({
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

    if (logError) {
      console.error('❌ [TOPUP] Failed to log action:', logError);
    } else {
      console.log('✅ [TOPUP] Action logged successfully');
    }

    // 8. Return success response
    console.log('✅ [TOPUP] ========== TOP-UP COMPLETED ==========');
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
    console.error('❌ [TOPUP] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
