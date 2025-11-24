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
    const { esimTranNo } = req.body;

    if (!esimTranNo) {
      return res.status(400).json({ success: false, error: 'esimTranNo is required' });
    }

    console.log('📊 Querying eSIM usage for esimTranNo:', esimTranNo);

    const usagePayload = {
      esimTranNoList: [esimTranNo]
    };
    console.log('📊 Usage query payload:', JSON.stringify(usagePayload));

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/usage/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usagePayload),
    });

    const data = await response.json();
    console.log('📊 eSIM usage response:', data);

    // Transform the response to match the expected format
    if (data.success && data.obj?.esimUsageList && data.obj.esimUsageList.length > 0) {
      const usageInfo = data.obj.esimUsageList[0];

      // Return formatted data with proper field names
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: usageInfo.totalData,      // Total data in bytes
            orderUsage: usageInfo.dataUsage,       // Used data in bytes
            lastUpdateTime: usageInfo.lastUpdateTime
          }]
        }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('❌ eSIM usage query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
