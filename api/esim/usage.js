// api/esim/usage.js - Vercel serverless function for querying eSIM usage data
const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

export default async function handler(req, res) {
  // Enable CORS
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
    const { orderNo } = req.body;

    if (!orderNo) {
      console.error('❌ [USAGE] Missing orderNo in request');
      return res.status(400).json({ success: false, error: 'orderNo is required' });
    }

    console.log('📊 [USAGE] ========== QUERYING eSIM USAGE DATA ==========');
    console.log('📊 [USAGE] Step 1: Getting eSIM details for Order:', orderNo);

    // Step 1: Query eSIM details to get esimTranNo
    const queryPayload = {
      orderNo,
      iccid: '',
      pager: {
        pageNum: 1,
        pageSize: 50
      }
    };
    console.log('📊 [USAGE] Query Payload:', JSON.stringify(queryPayload, null, 2));

    const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    console.log('📊 [USAGE] Query Response Status:', queryResponse.status);

    const queryData = await queryResponse.json();
    console.log('📊 [USAGE] Query Response:', JSON.stringify({
      success: queryData.success,
      errorCode: queryData.errorCode,
      errorMsg: queryData.errorMsg,
      esimCount: queryData.obj?.esimList?.length || 0
    }, null, 2));

    if (!queryData.success || !queryData.obj?.esimList || queryData.obj.esimList.length === 0) {
      console.error('❌ [USAGE] eSIM not found for order:', orderNo);
      return res.status(404).json({
        success: false,
        error: 'eSIM not found for this order',
        details: queryData.errorMsg || 'No eSIM data returned'
      });
    }

    const esimInfo = queryData.obj.esimList[0];
    const esimTranNo = esimInfo.esimTranNo;
    const esimStatus = esimInfo.esimStatus;
    const smdpStatus = esimInfo.smdpStatus;
    const totalVolume = esimInfo.totalVolume; // Total data from profile
    const orderUsage = esimInfo.orderUsage;   // Already used data from profile
    const expiredTime = esimInfo.expiredTime;

    console.log('📊 [USAGE] Step 2: eSIM Details Retrieved');
    console.log('📊 [USAGE] - esimTranNo:', esimTranNo);
    console.log('📊 [USAGE] - esimStatus:', esimStatus);
    console.log('📊 [USAGE] - smdpStatus:', smdpStatus);
    console.log('📊 [USAGE] - totalVolume (from profile):', totalVolume);
    console.log('📊 [USAGE] - orderUsage (from profile):', orderUsage);

    // Check if eSIM is in a state where usage makes sense
    // GOT_RESOURCE + RELEASED = not installed yet, no usage to query
    if (esimStatus === 'GOT_RESOURCE' && smdpStatus === 'RELEASED') {
      console.log('📊 [USAGE] eSIM not installed yet, returning profile data only');
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: totalVolume || 0,
            orderUsage: 0,
            esimTranNo: esimTranNo,
            smdpStatus: smdpStatus,
            esimStatus: esimStatus,
            expiredTime: expiredTime,
            source: 'profile' // Indicates data came from profile, not usage API
          }]
        }
      });
    }

    // For USED_UP or USED_EXPIRED, we can use the profile data directly
    // as the usage API might not return data for expired/depleted eSIMs
    if (esimStatus === 'USED_UP' || esimStatus === 'USED_EXPIRED') {
      console.log('📊 [USAGE] eSIM depleted/expired, returning profile data');
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: totalVolume || 0,
            orderUsage: orderUsage || totalVolume || 0, // If depleted, usage equals total
            esimTranNo: esimTranNo,
            smdpStatus: smdpStatus,
            esimStatus: esimStatus,
            expiredTime: expiredTime,
            source: 'profile'
          }]
        }
      });
    }

    // For active eSIMs, query the usage API for real-time data
    console.log('📊 [USAGE] Step 3: Querying usage data from usage API...');
    
    const usagePayload = {
      esimTranNoList: [esimTranNo]
    };
    console.log('📊 [USAGE] Usage Query Payload:', JSON.stringify(usagePayload, null, 2));

    const usageResponse = await fetch(`${ESIMACCESS_API_URL}/esim/usage/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usagePayload),
    });

    console.log('📊 [USAGE] Usage Response Status:', usageResponse.status);

    const usageData = await usageResponse.json();
    console.log('📊 [USAGE] Usage Response:', JSON.stringify({
      success: usageData.success,
      errorCode: usageData.errorCode,
      errorMsg: usageData.errorMsg,
      usageListCount: usageData.obj?.esimUsageList?.length || 0
    }, null, 2));

    // If usage API returns data, use it (more accurate/real-time)
    if (usageData.success && usageData.obj?.esimUsageList && usageData.obj.esimUsageList.length > 0) {
      const usageInfo = usageData.obj.esimUsageList[0];

      console.log('✅ [USAGE] Usage Data from usage API:', {
        totalData: usageInfo.totalData,
        dataUsage: usageInfo.dataUsage,
        lastUpdateTime: usageInfo.lastUpdateTime,
        percentageUsed: usageInfo.totalData > 0 
          ? ((usageInfo.dataUsage / usageInfo.totalData) * 100).toFixed(2) + '%'
          : 'N/A'
      });

      // Return formatted data using usage API response
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: usageInfo.totalData,      // Total data in bytes from usage API
            orderUsage: usageInfo.dataUsage,       // Used data in bytes from usage API
            lastUpdateTime: usageInfo.lastUpdateTime,
            esimTranNo: usageInfo.esimTranNo,
            smdpStatus: smdpStatus,
            esimStatus: esimStatus,
            expiredTime: expiredTime,
            source: 'usage_api' // Indicates data came from usage API
          }]
        }
      });
    }

    // Fallback: If usage API didn't return data, use profile data
    console.log('⚠️ [USAGE] Usage API returned no data, falling back to profile data');
    return res.json({
      success: true,
      obj: {
        esimList: [{
          totalVolume: totalVolume || 0,
          orderUsage: orderUsage || 0,
          esimTranNo: esimTranNo,
          smdpStatus: smdpStatus,
          esimStatus: esimStatus,
          expiredTime: expiredTime,
          source: 'profile_fallback'
        }]
      }
    });

  } catch (error) {
    console.error('❌ [USAGE] ========== ERROR ==========');
    console.error('❌ [USAGE] Error:', error.message);
    console.error('❌ [USAGE] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
}