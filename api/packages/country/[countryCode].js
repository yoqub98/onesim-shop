// api/packages/country/[countryCode].js
// Get all packages for a specific country
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { countryCode } = req.query;

    if (!countryCode) {
      return res.status(400).json({ success: false, error: 'Country code required' });
    }

    console.log(`📦 [PACKAGES] Fetching packages for country: ${countryCode}`);

    const { data, error } = await supabase
      .from('esim_packages')
      .select(`
        package_code,
        slug,
        name,
        description,
        location_code,
        location_type,
        data_volume,
        data_gb,
        duration,
        speed,
        api_price_usd,
        final_price_usd,
        effective_margin_percent,
        location_network_list,
        is_featured,
        popularity_score,
        view_count,
        order_count
      `)
      .eq('location_code', countryCode.toUpperCase())
      .eq('location_type', 'country')
      .eq('is_active', true)
      .eq('is_hidden', false)
      .order('popularity_score', { ascending: false })
      .order('final_price_usd', { ascending: true });

    if (error) {
      console.error('❌ [PACKAGES] Supabase error:', error);
      throw error;
    }

    console.log(`✅ [PACKAGES] Found ${data?.length || 0} packages`);

    // Transform to match existing frontend format
    const packages = data.map(pkg => ({
      id: pkg.slug,
      packageCode: pkg.package_code,
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description,
      country: pkg.name.split(' ')[0], // Extract country from name
      countryCode: pkg.location_code,
      data: pkg.data_gb >= 1
        ? `${pkg.data_gb.toFixed(0)}GB`
        : `${Math.round(pkg.data_volume / 1048576)}MB`,
      dataGB: parseFloat(pkg.data_gb),
      days: pkg.duration,
      speed: pkg.speed || '4G/LTE',
      originalPriceUSD: parseFloat(pkg.api_price_usd),
      priceUSD: parseFloat(pkg.final_price_usd),
      operatorList: pkg.location_network_list?.[0]?.operatorList || [],
      isFeatured: pkg.is_featured,
      popularity: pkg.popularity_score,
      viewCount: pkg.view_count,
      orderCount: pkg.order_count,
    }));

    res.json({
      success: true,
      data: packages,
      count: packages.length
    });

  } catch (error) {
    console.error('❌ [PACKAGES] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packages',
      message: error.message
    });
  }
}
