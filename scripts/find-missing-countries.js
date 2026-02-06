// scripts/find-missing-countries.js
// Find countries that are in DB but missing from i18n config
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { COUNTRY_TRANSLATIONS } from '../src/config/i18n.js';

dotenv.config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Common country names in English (for reference)
const COUNTRY_NAMES_EN = {
  EE: 'Estonia',
  LV: 'Latvia',
  LT: 'Lithuania',
  SK: 'Slovakia',
  SI: 'Slovenia',
  AL: 'Albania',
  BA: 'Bosnia and Herzegovina',
  ME: 'Montenegro',
  MK: 'North Macedonia',
  RU: 'Russia',
  AF: 'Afghanistan',
  BD: 'Bangladesh',
  PK: 'Pakistan',
  IQ: 'Iraq',
  LK: 'Sri Lanka',
  AG: 'Antigua and Barbuda',
  AI: 'Anguilla',
  AN: 'Netherlands Antilles',
  BB: 'Barbados',
  BN: 'Brunei',
  DM: 'Dominica',
  DO: 'Dominican Republic',
  GD: 'Grenada',
  GF: 'French Guiana',
  GP: 'Guadeloupe',
  GT: 'Guatemala',
  GU: 'Guam',
  HN: 'Honduras',
  JM: 'Jamaica',
  KN: 'Saint Kitts and Nevis',
  KY: 'Cayman Islands',
  LC: 'Saint Lucia',
  MQ: 'Martinique',
  MS: 'Montserrat',
  MU: 'Mauritius',
  NI: 'Nicaragua',
  PR: 'Puerto Rico',
  SV: 'El Salvador',
  TC: 'Turks and Caicos',
  VC: 'Saint Vincent and the Grenadines',
  VG: 'British Virgin Islands',
  AS: 'American Samoa',
  AX: 'Åland Islands',
  BF: 'Burkina Faso',
  BW: 'Botswana',
  CD: 'Congo (DRC)',
  CF: 'Central African Republic',
  CG: 'Congo',
  CI: 'Côte d\'Ivoire',
  GA: 'Gabon',
  GI: 'Gibraltar',
  GW: 'Guinea-Bissau',
  LI: 'Liechtenstein',
  LR: 'Liberia',
  MC: 'Monaco',
  MG: 'Madagascar',
  ML: 'Mali',
  MW: 'Malawi',
  MZ: 'Mozambique',
  NE: 'Niger',
  RE: 'Réunion',
  SC: 'Seychelles',
  SD: 'Sudan',
  SN: 'Senegal',
  SZ: 'Eswatini',
  TD: 'Chad',
  TZ: 'Tanzania',
  UG: 'Uganda',
  XK: 'Kosovo',
  ZM: 'Zambia',
  GG: 'Guernsey',
  IM: 'Isle of Man',
  JE: 'Jersey',
  TW: 'Taiwan',
};

async function findMissingCountries() {
  try {
    console.log('🔍 Finding missing countries...\n');

    // Get all countries from DB
    const { data: packages, error } = await supabase
      .from('esim_packages')
      .select('location_code, location_type, covered_countries')
      .eq('is_active', true);

    if (error) throw error;

    const dbCountries = new Set();

    packages.forEach(pkg => {
      // Add location_code if it's a country
      if (pkg.location_code && pkg.location_code.length === 2) {
        dbCountries.add(pkg.location_code);
      }

      // Add from covered_countries
      if (pkg.covered_countries && Array.isArray(pkg.covered_countries)) {
        pkg.covered_countries.forEach(country => {
          if (country.code && country.code.length === 2) {
            dbCountries.add(country.code);
          }
        });
      }
    });

    // Get countries from i18n (Russian version)
    const i18nCountries = new Set(
      Object.keys(COUNTRY_TRANSLATIONS.ru).filter(code => code.length === 2)
    );

    // Find missing countries
    const missingCountries = [...dbCountries].filter(code => !i18nCountries.has(code));

    console.log('📊 Statistics:');
    console.log(`   🌍 Countries in DB: ${dbCountries.size}`);
    console.log(`   📚 Countries in i18n: ${i18nCountries.size}`);
    console.log(`   ❌ Missing from i18n: ${missingCountries.length}\n`);

    if (missingCountries.length > 0) {
      console.log('❌ Countries in DB but MISSING from i18n config:');
      console.log('   Code | English Name | Packages');
      console.log('   -----|--------------|----------');

      const missingWithStats = [];

      for (const code of missingCountries.sort()) {
        const count = packages.filter(pkg => {
          if (pkg.location_code === code) return true;
          if (pkg.covered_countries) {
            return pkg.covered_countries.some(c => c.code === code);
          }
          return false;
        }).length;

        const name = COUNTRY_NAMES_EN[code] || 'Unknown';
        console.log(`   ${code}   | ${name.padEnd(25)} | ${count}`);
        missingWithStats.push({ code, name, count });
      }

      console.log('\n🔧 ACTION REQUIRED:');
      console.log('Add these countries to src/config/i18n.js in both "ru" and "uz" sections:\n');

      console.log('// Add to Russian (ru) section:');
      missingWithStats.forEach(({ code, name, count }) => {
        console.log(`${code}: '${name}', // ${count} packages`);
      });

      console.log('\n// Add to Uzbek (uz) section:');
      missingWithStats.forEach(({ code, name, count }) => {
        console.log(`${code}: '${name}', // ${count} packages (translate to Uzbek)`);
      });
    } else {
      console.log('✅ All countries are present in i18n config!');
    }

    // Also check for countries in i18n but not in DB (informational)
    const extraCountries = [...i18nCountries].filter(code => !dbCountries.has(code));
    if (extraCountries.length > 0) {
      console.log(`\n\n📝 INFO: ${extraCountries.length} countries in i18n but not in DB:`);
      console.log(extraCountries.sort().join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findMissingCountries();
