// api/exchange-rate.js
// Vercel Serverless Function to fetch CBU exchange rate
// This solves CORS issues by fetching from server-side

export default async function handler(req, res) {
  // Enable CORS for your domain
  res.setHeader('Access-Control-Allow-Origin', '*'); // Change to your domain in production
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Fetch from CBU API
    const cbuUrl = `https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/${dateStr}/`;
    console.log('[Serverless] Fetching from CBU:', cbuUrl);

    const response = await fetch(cbuUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CBU API returned status ${response.status}`);
    }

    const data = await response.json();

    // Validate response
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid response format from CBU API');
    }

    const usdData = data[0];
    const officialRate = parseFloat(usdData.Rate);

    if (isNaN(officialRate) || officialRate <= 0) {
      throw new Error('Invalid exchange rate received');
    }

    // Apply 1% markup
    const finalRate = Math.round(officialRate * 1.01);

    console.log('[Serverless] Official rate:', officialRate);
    console.log('[Serverless] Final rate with markup:', finalRate);

    // Return rate with metadata
    return res.status(200).json({
      success: true,
      rate: finalRate,
      officialRate,
      markup: 1.01,
      date: usdData.Date,
      source: 'CBU',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Serverless] Error:', error.message);

    // Return fallback rate with error info
    return res.status(200).json({
      success: false,
      rate: 12800, // Fallback rate
      error: error.message,
      source: 'fallback',
      timestamp: new Date().toISOString(),
    });
  }
}
