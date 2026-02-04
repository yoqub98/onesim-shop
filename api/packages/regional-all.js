// api/packages/regional-all.js
// Get all regional packages grouped by region
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
    console.log('📦 [PACKAGES] Fetching all regional packages');

    const { data, error } = await supabase
      .from('esim_packages')
      .select(`
        location_code,
        covered_countries,
        package_code
      `)
      .eq('location_type', 'regional')
      .eq('is_active', true)
      .eq('is_hidden', false);

    if (error) {
      console.error('❌ [PACKAGES] Supabase error:', error);
      throw error;
    }

    console.log(`✅ [PACKAGES] Found ${data?.length || 0} regional packages`);

    // Group by region
    const regionGroups = {};

    for (const pkg of data) {
      const regionCode = pkg.location_code;

      if (!regionGroups[regionCode]) {
        regionGroups[regionCode] = {
          packages: [],
          coveredCountries: new Set(),
          packageCount: 0,
        };
      }

      regionGroups[regionCode].packageCount++;

      // Aggregate covered countries
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

    // Convert to array format
    const result = {};
    for (const [regionCode, data] of Object.entries(regionGroups)) {
      result[regionCode] = {
        packageCount: data.packageCount,
        coveredCountries: Array.from(data.coveredCountries).map(s => JSON.parse(s)),
      };
    }

    res.json({
      success: true,
      data: result
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
