// api/esim/query.js - Vercel serverless function for querying eSIM profile
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
      console.error('❌ [ESIM-QUERY] Missing orderNo in request');
      return res.status(400).json({ success: false, error: 'orderNo is required' });
    }

    console.log('🔍 [ESIM-QUERY] ========== QUERYING eSIM PROFILE ==========');
    console.log('🔍 [ESIM-QUERY] Order Number:', orderNo);

    const queryPayload = {
      orderNo,
      iccid: '',
      pager: {
        pageNum: 1,  // Changed from pageNo to pageNum to match API docs
        pageSize: 50
      }
    };
    console.log('🔍 [ESIM-QUERY] Request Payload:', JSON.stringify(queryPayload, null, 2));

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryPayload),
    });

    console.log('🔍 [ESIM-QUERY] Response Status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📄 [ESIM-QUERY] Response Data:', JSON.stringify({
      success: data.success,
      errorCode: data.errorCode,
      errorMsg: data.errorMsg,
      esimCount: data.obj?.esimList?.length || 0
    }, null, 2));

    if (data.obj?.esimList?.length > 0) {
      console.log('✅ [ESIM-QUERY] Found', data.obj.esimList.length, 'eSIM(s)');
    } else {
      console.log('⚠️ [ESIM-QUERY] No eSIM data found');
    }

    res.json(data);
  } catch (error) {
    console.error('❌ [ESIM-QUERY] ========== ERROR ==========');
    console.error('❌ [ESIM-QUERY] Error:', error.message);
    console.error('❌ [ESIM-QUERY] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
};
