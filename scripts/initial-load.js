// scripts/initial-load.js
// Initial data load from eSIM Access API to Supabase
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const ESIMACCESS_API_KEY = process.env.ESIMACCESS_API_KEY || process.env.REACT_APP_ESIMACCESS_API_KEY;
const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getLocationType(locationCode, locationNetworkList) {
  if (!locationCode || locationCode === '' || locationCode === 'GLOBAL') {
    return 'global';
  }

  const uniqueCountries = new Set();
  locationNetworkList?.forEach(loc => {
    if (loc.locationCode) {
      uniqueCountries.add(loc.locationCode);
    }
  });

  return uniqueCountries.size > 1 ? 'regional' : 'country';
}

function getCoveredCountries(locationNetworkList) {
  if (!locationNetworkList) return [];

  return locationNetworkList.map(loc => ({
    code: loc.locationCode,
    name: loc.locationName,
    operators: loc.operatorList?.map(op => ({
      name: op.operatorName,
      network: op.networkType
    })) || []
  }));
}

async function loadAllPackages() {
  console.log('🚀 Starting initial package load...');
  const startTime = Date.now();

  try {
    console.log('📡 Fetching packages from eSIM Access API...');
    console.log('🔑 Using API Key:', ESIMACCESS_API_KEY ? 'Present' : 'MISSING');
    console.log('🌐 API URL:', ESIMACCESS_API_URL);

    const response = await fetch(`${ESIMACCESS_API_URL}/package/list`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationCode: '',
        type: '',
        slug: '',
        packageCode: '',
        iccid: '',
      }),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.obj?.packageList) {
      throw new Error('Invalid API response structure');
    }

    const packages = data.obj.packageList;
    console.log(`📦 Received ${packages.length} packages`);

    const packagesToInsert = [];
    const operatorsToInsert = [];
    let skipped = 0;

    for (const pkg of packages) {
      // Skip invalid packages
      if (!pkg.packageCode || !pkg.slug || !pkg.price || !pkg.volume) {
        console.warn(`⚠️  Skipping invalid package: ${pkg.packageCode}`);
        skipped++;
        continue;
      }

      const locationType = getLocationType(pkg.locationCode, pkg.locationNetworkList);
      const coveredCountries = getCoveredCountries(pkg.locationNetworkList);

      packagesToInsert.push({
        package_code: pkg.packageCode,
        slug: pkg.slug,
        name: pkg.name || pkg.description || `${pkg.slug} Package`,
        description: pkg.description,

        location_code: pkg.locationCode || 'GLOBAL',
        location_type: locationType,
        covered_countries: coveredCountries,

        data_volume: pkg.volume,
        duration: pkg.duration,
        duration_unit: pkg.durationUnit || 'DAY',
        speed: pkg.speed,

        api_price: pkg.price,
        retail_price: pkg.retailPrice,
        currency_code: pkg.currencyCode || 'USD',

        sms_status: pkg.smsStatus || 0,
        data_type: pkg.dataType,
        active_type: pkg.activeType,
        ip_export: pkg.ipExport,
        fup_policy: pkg.fupPolicy,
        support_topup_type: pkg.supportTopUpType,
        unused_valid_time: pkg.unusedValidTime,

        location_network_list: pkg.locationNetworkList || [],

        is_active: true,
        last_synced_at: new Date().toISOString(),
      });

      // Extract operators
      if (pkg.locationNetworkList) {
        for (const location of pkg.locationNetworkList) {
          if (location.operatorList) {
            for (const operator of location.operatorList) {
              operatorsToInsert.push({
                package_code: pkg.packageCode,
                location_code: location.locationCode,
                location_name: location.locationName,
                operator_name: operator.operatorName,
                network_type: operator.networkType,
              });
            }
          }
        }
      }
    }

    console.log(`💾 Inserting ${packagesToInsert.length} packages (skipped ${skipped})...`);

    const BATCH_SIZE = 100;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < packagesToInsert.length; i += BATCH_SIZE) {
      const batch = packagesToInsert.slice(i, i + BATCH_SIZE);

      const { error } = await supabase
        .from('esim_packages')
        .upsert(batch, { onConflict: 'package_code' });

      if (error) {
        console.error(`❌ Batch ${i}-${i + BATCH_SIZE}:`, error.message);
        errors++;
        continue;
      }

      inserted += batch.length;
      const progress = ((inserted / packagesToInsert.length) * 100).toFixed(1);
      console.log(`✅ Progress: ${inserted}/${packagesToInsert.length} (${progress}%)`);
    }

    console.log(`💾 Inserting ${operatorsToInsert.length} operator records...`);

    for (let i = 0; i < operatorsToInsert.length; i += BATCH_SIZE) {
      const batch = operatorsToInsert.slice(i, i + BATCH_SIZE);

      await supabase
        .from('package_operators')
        .upsert(batch, {
          onConflict: 'package_code,location_code,operator_name',
          ignoreDuplicates: true
        });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const stats = {
      country: packagesToInsert.filter(p => p.location_type === 'country').length,
      regional: packagesToInsert.filter(p => p.location_type === 'regional').length,
      global: packagesToInsert.filter(p => p.location_type === 'global').length,
    };

    await supabase.from('price_sync_log').insert({
      sync_started_at: new Date(startTime).toISOString(),
      sync_completed_at: new Date().toISOString(),
      status: errors > 0 ? 'partial' : 'success',
      packages_added: inserted,
      changes_summary: {
        initial_load: true,
        total_packages: inserted,
        skipped,
        errors,
        duration_seconds: duration,
        location_types: stats
      }
    });

    console.log('\n🎉 Initial load completed!');
    console.log(`📊 Statistics:`);
    console.log(`   ⏱️  Duration: ${duration}s`);
    console.log(`   📦 Total packages: ${inserted}`);
    console.log(`   🌍 Country: ${stats.country}`);
    console.log(`   🗺️  Regional: ${stats.regional}`);
    console.log(`   🌐 Global: ${stats.global}`);
    console.log(`   👥 Operators: ${operatorsToInsert.length}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);

    await supabase.from('price_sync_log').insert({
      sync_started_at: new Date(startTime).toISOString(),
      sync_completed_at: new Date().toISOString(),
      status: 'failed',
      error_message: error.message,
    });

    process.exit(1);
  }
}

loadAllPackages();
