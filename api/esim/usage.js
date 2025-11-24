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
      return res.status(400).json({ success: false, error: 'orderNo is required' });
    }

    console.log('📊 Step 1: Querying eSIM details for orderNo:', orderNo);

    // Step 1: Query eSIM details to get esimTranNo
    const queryPayload = {
      orderNo,
      iccid: '',
      pager: {
        pageNum: 1,
        pageSize: 50
      }
    };
    console.log('📊 Query payload:', JSON.stringify(queryPayload));

    const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    const queryData = await queryResponse.json();
    console.log('📊 eSIM query response:', queryData);

    if (!queryData.success || !queryData.obj?.esimList || queryData.obj.esimList.length === 0) {
      return res.status(404).json({ success: false, error: 'eSIM not found for this order' });
    }

    const esimTranNo = queryData.obj.esimList[0].esimTranNo;
    console.log('📊 Step 2: Got esimTranNo:', esimTranNo, '- Now querying usage data');

    // Step 2: Query usage data using esimTranNo
    const usagePayload = {
      esimTranNoList: [esimTranNo]
    };
    console.log('📊 Usage query payload:', JSON.stringify(usagePayload));

    const usageResponse = await fetch(`${ESIMACCESS_API_URL}/esim/usage/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usagePayload),
    });

    const usageData = await usageResponse.json();
    console.log('📊 eSIM usage response:', usageData);

    // Transform the response to match the expected format
    if (usageData.success && usageData.obj?.esimUsageList && usageData.obj.esimUsageList.length > 0) {
      const usageInfo = usageData.obj.esimUsageList[0];

      // Return formatted data with proper field names
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: usageInfo.totalData,      // Total data in bytes
            orderUsage: usageInfo.dataUsage,       // Used data in bytes
            lastUpdateTime: usageInfo.lastUpdateTime,
            esimTranNo: usageInfo.esimTranNo
          }]
        }
      });
    }

    res.json(usageData);
  } catch (error) {
    console.error('❌ eSIM usage query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
