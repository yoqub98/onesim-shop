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

    const esimTranNo = queryData.obj.esimList[0].esimTranNo;
    const esimStatus = queryData.obj.esimList[0].esimStatus;
    const smdpStatus = queryData.obj.esimList[0].smdpStatus;

    console.log('📊 [USAGE] Step 2: eSIM Details Retrieved');
    console.log('📊 [USAGE] - esimTranNo:', esimTranNo);
    console.log('📊 [USAGE] - esimStatus:', esimStatus);
    console.log('📊 [USAGE] - smdpStatus:', smdpStatus);
    console.log('📊 [USAGE] Now querying usage data...');

    // Step 2: Query usage data using esimTranNo
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

    // Transform the response to match the expected format
    if (usageData.success && usageData.obj?.esimUsageList && usageData.obj.esimUsageList.length > 0) {
      const usageInfo = usageData.obj.esimUsageList[0];

      console.log('✅ [USAGE] Usage Data Retrieved:', {
        totalData: usageInfo.totalData,
        dataUsage: usageInfo.dataUsage,
        percentageUsed: ((usageInfo.dataUsage / usageInfo.totalData) * 100).toFixed(2) + '%'
      });

      // Return formatted data with proper field names
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: usageInfo.totalData,      // Total data in bytes
            orderUsage: usageInfo.dataUsage,       // Used data in bytes
            lastUpdateTime: usageInfo.lastUpdateTime,
            esimTranNo: usageInfo.esimTranNo,
            smdpStatus: smdpStatus,
            esimStatus: esimStatus
          }]
        }
      });
    }

    console.log('⚠️ [USAGE] No usage data available');
    res.json(usageData);
  } catch (error) {
    console.error('❌ [USAGE] ========== ERROR ==========');
    console.error('❌ [USAGE] Error:', error.message);
    console.error('❌ [USAGE] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
};
