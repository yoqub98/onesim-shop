// scripts/check-countries.js
// Check which countries we have packages for in the database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCountries() {
  try {
    console.log('🔍 Checking countries in database...\n');

    // Query all active packages
    const { data: packages, error } = await supabase
      .from('esim_packages')
      .select('location_code, location_type, covered_countries')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    console.log(`📦 Total active packages: ${packages.length}\n`);

    // Extract unique location codes
    const locationCodes = new Set();
    const countryCodes = new Set();

    packages.forEach(pkg => {
      if (pkg.location_code && pkg.location_code !== 'GLOBAL') {
        locationCodes.add(pkg.location_code);

        if (pkg.location_type === 'country') {
          countryCodes.add(pkg.location_code);
        }
      }

      // Also extract from covered_countries
      if (pkg.covered_countries && Array.isArray(pkg.covered_countries)) {
        pkg.covered_countries.forEach(country => {
          if (country.code && country.code.length === 2) {
            countryCodes.add(country.code);
          }
        });
      }
    });

    console.log('🌍 Unique location codes found:', locationCodes.size);
    console.log('🌎 Unique country codes found:', countryCodes.size);
    console.log('\n📋 All location codes:');
    console.log([...locationCodes].sort().join(', '));

    console.log('\n📋 All country codes (2-letter):');
    const sortedCountries = [...countryCodes].sort();
    console.log(sortedCountries.join(', '));

    // Stats by location type
    const stats = {
      country: packages.filter(p => p.location_type === 'country').length,
      regional: packages.filter(p => p.location_type === 'regional').length,
      global: packages.filter(p => p.location_type === 'global').length,
    };

    console.log('\n📊 Packages by type:');
    console.log(`   🌍 Country: ${stats.country}`);
    console.log(`   🗺️  Regional: ${stats.regional}`);
    console.log(`   🌐 Global: ${stats.global}`);

    // Return the country codes for further processing
    return sortedCountries;

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCountries();
