// api/packages/slug/[slug].js
// Get a single package by slug
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ success: false, error: 'Slug required' });
    }

    console.log(`📦 [PACKAGES] Fetching package by slug: ${slug}`);

    const { data, error } = await supabase
      .from('esim_packages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ [PACKAGES] Supabase error:', error);

      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Package not found'
        });
      }

      throw error;
    }

    console.log(`✅ [PACKAGES] Found package: ${data.package_code}`);

    // Transform to match existing format
    const pkg = {
      id: data.slug,
      packageCode: data.package_code,
      slug: data.slug,
      name: data.name,
      description: data.description,
      locationCode: data.location_code,
      locationType: data.location_type,

      data: data.data_gb >= 1
        ? `${data.data_gb.toFixed(0)}GB`
        : `${Math.round(data.data_volume / 1048576)}MB`,
      dataGB: parseFloat(data.data_gb),
      days: data.duration,
      speed: data.speed || '4G/LTE',

      // IMPORTANT: Return BOTH prices
      originalPriceUSD: parseFloat(data.api_price_usd),
      priceUSD: parseFloat(data.api_price_usd), // Original for orders
      finalPriceUSD: parseFloat(data.final_price_usd), // With margin for display

      operatorList: data.location_network_list || [],
      coveredCountries: data.covered_countries || [],

      smsSupported: data.sms_status > 0,
      isFeatured: data.is_featured,
    };

    // Track view analytics (non-blocking)
    if (req.method === 'GET') {
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers['referer'] || req.headers['referrer'];
      const forwarded = req.headers['x-forwarded-for'];
      const ip = forwarded ? forwarded.split(',')[0] : req.connection?.remoteAddress;

      supabase.from('package_views').insert({
        package_code: data.package_code,
        session_id: req.headers['x-session-id'],
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
      }).then(() => {}).catch(err => {
        console.warn('⚠️  Failed to track view:', err.message);
      });
    }

    res.json({
      success: true,
      data: pkg
    });

  } catch (error) {
    console.error('❌ [PACKAGES] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch package',
      message: error.message
    });
  }
}
