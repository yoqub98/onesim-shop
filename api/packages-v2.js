// api/packages-v2.js
// Consolidated package endpoints to avoid Vercel function limit
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// CORS headers
const setCORS = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req, res) {
  setCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { type, country, region, slug } = req.query;

    // Route based on type parameter
    if (type === 'country' && country) {
      return await handleCountryPackages(country, res);
    } else if (type === 'regional' && region) {
      return await handleRegionalPackages(region, res);
    } else if (type === 'regional-all') {
      return await handleAllRegionalPackages(res);
    } else if (type === 'global') {
      return await handleGlobalPackages(res);
    } else if (type === 'slug' && slug) {
      return await handlePackageBySlug(slug, req, res);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        usage: {
          country: '/api/packages-v2?type=country&country=TR',
          regional: '/api/packages-v2?type=regional&region=EU',
          'regional-all': '/api/packages-v2?type=regional-all',
          global: '/api/packages-v2?type=global',
          slug: '/api/packages-v2?type=slug&slug=TR_20_30'
        }
      });
    }

  } catch (error) {
    console.error('❌ [PACKAGES-V2] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Handler: Country packages
async function handleCountryPackages(countryCode, res) {
  console.log(`📦 [PACKAGES-V2] Fetching packages for country: ${countryCode}`);

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

  if (error) throw error;

  const packages = data.map(pkg => ({
    id: pkg.slug,
    packageCode: pkg.package_code,
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    country: pkg.name.split(' ')[0],
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

  return res.json({ success: true, data: packages, count: packages.length });
}

// Handler: Regional packages
async function handleRegionalPackages(regionCode, res) {
  console.log(`📦 [PACKAGES-V2] Fetching regional packages for: ${regionCode}`);

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

  if (error) throw error;

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

  return res.json({ success: true, data: packages, count: packages.length });
}

// Handler: All regional packages
async function handleAllRegionalPackages(res) {
  console.log('📦 [PACKAGES-V2] Fetching all regional packages');

  const { data, error } = await supabase
    .from('esim_packages')
    .select('location_code, covered_countries, package_code')
    .eq('location_type', 'regional')
    .eq('is_active', true)
    .eq('is_hidden', false);

  if (error) throw error;

  const regionGroups = {};
  for (const pkg of data) {
    const regionCode = pkg.location_code;
    if (!regionGroups[regionCode]) {
      regionGroups[regionCode] = {
        packageCount: 0,
        coveredCountries: new Set(),
      };
    }
    regionGroups[regionCode].packageCount++;
    if (pkg.covered_countries) {
      pkg.covered_countries.forEach(country => {
        if (country.code) {
          regionGroups[regionCode].coveredCountries.add(
            JSON.stringify({ code: country.code, name: country.name })
          );
        }
      });
    }
  }

  const result = {};
  for (const [regionCode, data] of Object.entries(regionGroups)) {
    result[regionCode] = {
      packageCount: data.packageCount,
      coveredCountries: Array.from(data.coveredCountries).map(s => JSON.parse(s)),
    };
  }

  return res.json({ success: true, data: result });
}

// Handler: Global packages
async function handleGlobalPackages(res) {
  console.log('📦 [PACKAGES-V2] Fetching global packages');

  const { data, error } = await supabase
    .from('esim_packages')
    .select(`
      package_code,
      slug,
      name,
      description,
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
    .eq('location_type', 'global')
    .eq('is_active', true)
    .eq('is_hidden', false)
    .order('popularity_score', { ascending: false })
    .order('final_price_usd', { ascending: true });

  if (error) throw error;

  const packages = data.map(pkg => ({
    packageCode: pkg.package_code,
    slug: pkg.slug,
    name: pkg.name,
    description: pkg.description,
    price: pkg.final_price_usd * 10000,
    volume: pkg.data_volume,
    duration: pkg.duration,
    speed: pkg.speed || '4G/5G',
    locationNetworkList: pkg.location_network_list || [],
    coveredCountries: pkg.covered_countries || [],
    isFeatured: pkg.is_featured,
  }));

  return res.json({ success: true, data: packages, count: packages.length });
}

// Handler: Single package by slug
async function handlePackageBySlug(slug, req, res) {
  console.log(`📦 [PACKAGES-V2] Fetching package by slug: ${slug}`);

  const { data, error } = await supabase
    .from('esim_packages')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    throw error;
  }

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
    originalPriceUSD: parseFloat(data.api_price_usd),
    priceUSD: parseFloat(data.api_price_usd),
    finalPriceUSD: parseFloat(data.final_price_usd),
    operatorList: data.location_network_list || [],
    coveredCountries: data.covered_countries || [],
    smsSupported: data.sms_status > 0,
    isFeatured: data.is_featured,
  };

  // Track view (non-blocking)
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
    }).then(() => {}).catch(() => {});
  }

  return res.json({ success: true, data: pkg });
}
