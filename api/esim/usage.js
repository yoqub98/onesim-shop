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
    const { iccid } = req.body;

    if (!iccid) {
      return res.status(400).json({ success: false, error: 'iccid is required' });
    }

    console.log('📊 Querying eSIM usage for ICCID:', iccid);

    const usagePayload = {
      iccid,
      pager: {
        pageNum: 1,
        pageSize: 20
      }
    };
    console.log('📊 Usage query payload:', JSON.stringify(usagePayload));

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/list`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usagePayload),
    });

    const data = await response.json();
    console.log('📊 eSIM usage response:', data);

    res.json(data);
  } catch (error) {
    console.error('❌ eSIM usage query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
