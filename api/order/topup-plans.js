// api/order/topup-plans.js - Get available top-up plans for an eSIM
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
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Fetch USD to UZS exchange rate from CBU
async function getExchangeRate() {
  try {
    // Check cache first
    if (cachedRate && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      console.log('💱 [TOPUP-PLANS] Using cached exchange rate:', cachedRate);
      return cachedRate;
    }

    console.log('💱 [TOPUP-PLANS] Fetching exchange rate from CBU...');
    const response = await fetch(`${CBU_API_URL}/USD/${Date.now()}/`);

    if (!response.ok) {
      throw new Error(`CBU API error: ${response.status}`);
    }

    const data = await response.json();
    const rate = parseFloat(data[0]?.Rate);

    if (!rate || isNaN(rate)) {
      throw new Error('Invalid exchange rate received from CBU');
    }

    // Update cache
    cachedRate = rate;
    cacheTime = Date.now();

    console.log('💱 [TOPUP-PLANS] Exchange rate fetched:', rate);
    return rate;
  } catch (error) {
    console.error('❌ [TOPUP-PLANS] Failed to fetch exchange rate:', error.message);
    // Return fallback rate if CBU is unavailable
    const fallbackRate = 12800;
    console.log('💱 [TOPUP-PLANS] Using fallback exchange rate:', fallbackRate);
    return fallbackRate;
  }
}

export default async function handler(req, res) {
  console.log('🔄 [TOPUP-PLANS] ========== GET TOP-UP PLANS REQUEST ==========');
  console.log('🔄 [TOPUP-PLANS] Method:', req.method);

  if (req.method !== 'POST') {
    console.log('❌ [TOPUP-PLANS] Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, userId } = req.body;

    console.log('📊 [TOPUP-PLANS] Request data:', { orderId, userId });

    if (!orderId || !userId) {
      console.log('❌ [TOPUP-PLANS] Missing required fields');
      return res.status(400).json({ error: 'orderId and userId are required' });
    }

    // 1. Fetch order from database
    console.log('🔍 [TOPUP-PLANS] Fetching order from database...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      console.error('❌ [TOPUP-PLANS] Order not found:', orderError);
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('✅ [TOPUP-PLANS] Order found:', {
      order_no: order.order_no,
      package_code: order.package_code,
      iccid: order.iccid,
      esim_status: order.esim_status,
      smdp_status: order.smdp_status,
    });

    // 2. Check if eSIM supports top-up (must have ICCID)
    if (!order.iccid) {
      console.log('❌ [TOPUP-PLANS] Order does not have ICCID');
      return res.status(400).json({ error: 'eSIM not yet activated. ICCID is required for top-up.' });
    }

    // 3. Check top-up count limit (max 10 top-ups)
    console.log('🔍 [TOPUP-PLANS] Checking top-up count...');
    const { data: topupCount, error: countError } = await supabase.rpc('get_order_topup_count', {
      p_order_id: orderId,
    });

    if (countError) {
      console.error('❌ [TOPUP-PLANS] Error checking top-up count:', countError);
    } else {
      console.log('📊 [TOPUP-PLANS] Current top-up count:', topupCount);
      if (topupCount >= 10) {
        console.log('❌ [TOPUP-PLANS] Maximum top-up limit reached');
        return res.status(400).json({
          error: 'Maximum top-up limit reached (10 top-ups per eSIM)',
          topupCount,
          maxTopups: 10
        });
      }
    }

    // 4. Call eSIMAccess API to get available top-up plans
    console.log('🌐 [TOPUP-PLANS] Calling eSIMAccess API...');
    const apiRequestBody = {
      type: 'TOPUP',
      packageCode: order.package_code,
      iccid: order.iccid,
      locationCode: '',
    };

    console.log('📤 [TOPUP-PLANS] API Request:', apiRequestBody);

    const apiResponse = await fetch(`${ESIMACCESS_API_URL}/package/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `topup_plans_${Date.now()}`,
      },
      body: JSON.stringify(apiRequestBody),
    });

    if (!apiResponse.ok) {
      console.error('❌ [TOPUP-PLANS] eSIMAccess API error:', apiResponse.status);
      throw new Error(`eSIMAccess API error: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    console.log('📥 [TOPUP-PLANS] API Response:', JSON.stringify(apiData, null, 2));

    if (!apiData.success || !apiData.obj || !Array.isArray(apiData.obj.packageList)) {
      console.error('❌ [TOPUP-PLANS] Invalid API response');
      return res.status(500).json({ error: 'Failed to fetch top-up plans' });
    }

    const plans = apiData.obj.packageList;
    console.log(`✅ [TOPUP-PLANS] Found ${plans.length} top-up plan(s)`);

    // 5. Get exchange rate
    const exchangeRate = await getExchangeRate();

    // 6. Transform and enrich plans data
    const enrichedPlans = plans.map((plan) => {
      const priceUsd = plan.price / 10000; // Convert from cents
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

    console.log('✅ [TOPUP-PLANS] Enriched plans:', enrichedPlans.length);

    return res.status(200).json({
      success: true,
      plans: enrichedPlans,
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
    console.error('❌ [TOPUP-PLANS] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
