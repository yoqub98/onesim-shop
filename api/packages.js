// api/packages.js
// Vercel Serverless Function - API Proxy for esimAccess

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 [PACKAGES-API] Request body:', JSON.stringify(req.body));

    const response = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
      method: 'POST',
      headers: {
        'RT-AccessCode': process.env.REACT_APP_ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Log what we got from eSIMAccess
    if (data.success && data.obj?.packageList) {
      console.log(`📦 [PACKAGES-API] eSIMAccess returned ${data.obj.packageList.length} packages`);

      // Log first 3 packages for debugging
      data.obj.packageList.slice(0, 3).forEach((pkg, idx) => {
        console.log(`  Package ${idx + 1}:`, {
          code: pkg.packageCode,
          name: pkg.name,
          location: pkg.location,
          price: pkg.price,
          priceUSD: (pkg.price / 10000).toFixed(2),
          volume: Math.round(pkg.volume / 1073741824) + 'GB',
          duration: pkg.duration + ' days'
        });
      });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch packages',
      message: error.message 
    });
  }
}