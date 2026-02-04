// api/packages/regional/[regionCode].js
// Get all packages for a specific region
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
    const { regionCode } = req.query;

    if (!regionCode) {
      return res.status(400).json({ success: false, error: 'Region code required' });
    }

    console.log(`📦 [PACKAGES] Fetching regional packages for: ${regionCode}`);

    const { data, error } = await supabase
      .from('esim_packages')
      .select(`
        package_code,
        slug,
        name,
        description,
        location_code,
        covered_countries,
        data_volume,
        data_gb,
        duration,
        speed,
        api_price_usd,
        final_price_usd,
        location_network_list,
        is_featured,
        popularity_score
      `)
      .eq('location_code', regionCode.toUpperCase())
      .eq('location_type', 'regional')
      .eq('is_active', true)
      .eq('is_hidden', false)
      .order('popularity_score', { ascending: false })
      .order('final_price_usd', { ascending: true });

    if (error) {
      console.error('❌ [PACKAGES] Supabase error:', error);
      throw error;
    }

    console.log(`✅ [PACKAGES] Found ${data?.length || 0} regional packages`);

    const packages = data.map(pkg => ({
      id: pkg.slug,
      packageCode: pkg.package_code,
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description,
      country: regionCode,
      countryCode: pkg.location_code,
      data: pkg.data_gb >= 1
        ? `${pkg.data_gb.toFixed(0)}GB`
        : `${Math.round(pkg.data_volume / 1048576)}MB`,
      dataGB: parseFloat(pkg.data_gb),
      days: pkg.duration,
      speed: pkg.speed || '4G/LTE',
      originalPriceUSD: parseFloat(pkg.api_price_usd),
      priceUSD: parseFloat(pkg.final_price_usd),
      operatorList: pkg.location_network_list || [],
      coveredCountries: pkg.covered_countries || [],
      isFeatured: pkg.is_featured,
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
      error: 'Failed to fetch regional packages',
      message: error.message
    });
  }
}
