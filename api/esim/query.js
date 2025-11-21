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
      return res.status(400).json({ success: false, error: 'orderNo is required' });
    }

    console.log('🔍 Querying eSIM profile for order:', orderNo);

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNo }),
    });

    const data = await response.json();
    console.log('📄 eSIM query response:', data);

    res.json(data);
  } catch (error) {
    console.error('❌ eSIM query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
