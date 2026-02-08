// api/price-sync.js
// Daily price sync from eSIM Access pricing history API
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_KEY = process.env.ESIMACCESS_API_KEY || process.env.REACT_APP_ESIMACCESS_API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Auth check: Allow Vercel Cron OR Bearer token
  const authHeader = req.headers.authorization;
  const isVercelCron = req.headers['x-vercel-cron'];

  console.log('🔍 Auth check:', { isVercelCron: !!isVercelCron, hasAuthHeader: !!authHeader });

  if (!isVercelCron && (!authHeader || authHeader !== `Bearer ${process.env.SYNC_SECRET_KEY}`)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const startTime = Date.now();
  const logId = `sync_${Date.now()}`;
  let syncLogId = null;

  try {
    console.log(`🔄 [${logId}] Starting price sync...`);

    const { data: syncLog, error: logError } = await supabase
      .from('price_sync_log')
      .insert({
        sync_started_at: new Date().toISOString(),
        status: 'running',
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Failed to create sync log:', logError);
      throw new Error(`Failed to create sync log: ${logError.message}`);
    }

    syncLogId = syncLog?.id;

    if (!syncLogId) {
      throw new Error('Sync log created but no ID returned');
    }
    const daysToCheck = req.body?.days || 7;
    console.log(`📡 [${logId}] Fetching price changes (last ${daysToCheck} days)...`);

    const response = await fetch(
      `https://app.esimaccess.com/api/pricing-history/changes?days=${daysToCheck}&type=all&limit=1000`,
      {
        headers: {
          'RT-AccessCode': ESIMACCESS_API_KEY,
        },
      }
    );

    console.log(`📡 [${logId}] API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${logId}] API error response:`, errorText.substring(0, 500));
      throw new Error(`Price history API returned ${response.status}: ${errorText.substring(0, 100)}`);
    }

    const priceData = await response.json();

    // Log raw response structure
    console.log(`📊 [${logId}] Raw API response keys:`, Object.keys(priceData));

    // Handle actual eSIM Access API format: {changes, summary, pagination, filters}
    let changes;

    if (priceData.changes && Array.isArray(priceData.changes)) {
      // eSIM Access API format: {changes: [...]}
      console.log(`✅ [${logId}] Found ${priceData.changes.length} changes in 'changes' field`);
      changes = priceData.changes;
    } else if (Array.isArray(priceData)) {
      // Response is directly an array
      console.log(`✅ [${logId}] Response is direct array with ${priceData.length} items`);
      changes = priceData;
    } else if (priceData.data && Array.isArray(priceData.data)) {
      // Response has {data} field
      console.log(`✅ [${logId}] Response has data field`);
      changes = priceData.data;
    } else {
      // Unknown format
      console.error(`❌ [${logId}] Unknown response format:`, JSON.stringify(priceData).substring(0, 500));
      throw new Error(`Invalid price history response format. Keys: ${Object.keys(priceData).join(', ')}`);
    }
    console.log(`📊 [${logId}] Found ${changes.length} price changes`);

    if (changes.length === 0) {
      console.log(`✅ [${logId}] No price changes detected`);

      await supabase
        .from('price_sync_log')
        .update({
          sync_completed_at: new Date().toISOString(),
          status: 'success',
          total_changes_detected: 0,
          packages_updated: 0,
        })
        .eq('id', syncLogId);

      return res.json({
        success: true,
        message: 'No price changes detected',
        changes: 0,
      });
    }

    let updated = 0;
    let notFound = 0;
    let autoImported = 0;
    const changeDetails = [];
    const missingPackages = []; // Track packages not found in DB
    const importedPackages = []; // Track auto-imported packages

    for (const change of changes) {
      // Skip product_added events (new products, not price changes)
      if (change.event_type === 'product_added') {
        console.log(`ℹ️  [${logId}] Skipping new product: ${change.package_code}`);
        continue;
      }

      // Skip if no price change data
      if (!change.old_value?.price || !change.new_value?.price) {
        console.warn(`⚠️  [${logId}] ${change.package_code}: Missing price data, skipping`);
        continue;
      }

      // Map API format to our internal format
      const packageCode = change.package_code;
      const oldPriceUSD = parseFloat(change.old_value.price);
      const newPriceUSD = parseFloat(change.new_value.price);
      const oldPrice = Math.round(oldPriceUSD * 10000); // Convert to cents * 100
      const newPrice = Math.round(newPriceUSD * 10000);
      const changePercent = (((newPrice - oldPrice) / oldPrice) * 100).toFixed(2);

      console.log(
        `📝 [${logId}] ${packageCode}: $${oldPriceUSD.toFixed(2)} → $${newPriceUSD.toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent}%)`
      );

      const { data: existingPkg } = await supabase
        .from('esim_packages')
        .select('package_code, api_price')
        .eq('package_code', packageCode)
        .single();

      if (!existingPkg) {
        console.log(`🔄 [${logId}] Package ${packageCode} not found - AUTO-IMPORTING...`);

        try {
          // Extract location info from slug (e.g., "CR_3_30" -> country: CR)
          const slugParts = change.slug?.split('_') || [];
          const locationCode = slugParts[0] || 'UNKNOWN';

          // Determine location type (country codes are 2 letters, regional are longer)
          const locationType = locationCode.length === 2 ? 'country' : 'regional';

          // Fetch full package details from eSIM Access API (price change events lack volume/duration)
          // Fetch full package details from eSIM Access API (price change events lack volume/duration)
          console.log(`📡 [${logId}] Fetching full details for ${packageCode} (slug: ${change.slug})...`);
          let matchedPkg = null;

          try {
            const pkgResponse = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
              method: 'POST',
              headers: {
                'RT-AccessCode': ESIMACCESS_API_KEY,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                locationCode: '',
                type: '',
                slug: change.slug,
                packageCode: '',
                iccid: '',
              }),
            });

            if (pkgResponse.ok) {
              const pkgData = await pkgResponse.json();
              const pkgList = pkgData?.obj?.packageList || [];
              matchedPkg = pkgList.find(p => p.packageCode === packageCode) || pkgList[0];

              if (matchedPkg) {
                console.log(`✅ [${logId}] Got details for ${packageCode}: volume=${matchedPkg.volume}, duration=${matchedPkg.duration}`);
              } else {
                console.warn(`⚠️ [${logId}] API returned no matching package for slug ${change.slug}`);
              }
            } else {
              console.warn(`⚠️ [${logId}] Package list API returned ${pkgResponse.status} for slug ${change.slug}`);
            }
          } catch (fetchErr) {
            console.error(`❌ [${logId}] Failed to fetch package details for ${packageCode}:`, fetchErr.message);
          }

          // Skip import if we couldn't get full package details
          if (!matchedPkg || !matchedPkg.volume || !matchedPkg.duration) {
            console.error(`❌ [${logId}] Cannot import ${packageCode}: could not fetch full package details from API`);
            notFound++;
            missingPackages.push({
              package_code: packageCode,
              product_name: change.product_name,
              slug: change.slug,
              new_price_usd: newPriceUSD.toFixed(2),
              error: 'Could not fetch full package details from eSIM Access API',
            });
            continue;
          }

          // Build covered_countries from locationNetworkList
          const locationNetworkList = matchedPkg.locationNetworkList || [];
          const coveredCountries = locationNetworkList.map(loc => ({
            code: loc.locationCode,
            name: loc.locationName,
          }));

          // Re-determine location type based on actual data
          const actualLocationType = locationNetworkList.length > 1 ? 'regional' : 'country';

          // Import the package with full data from API
          const { data: importedPkg, error: importError } = await supabase
            .from('esim_packages')
            .insert({
              package_code: packageCode,
              slug: change.slug,
              name: matchedPkg.name || change.product_name,
              location_code: locationCode,
              location_type: actualLocationType,
              covered_countries: coveredCountries.length > 0 ? coveredCountries : null,
              api_price: matchedPkg.price || newPrice,
              data_volume: matchedPkg.volume,
              duration: matchedPkg.duration,
              duration_unit: 'DAY',
              speed: matchedPkg.speed || null,
              sms_status: matchedPkg.smsStatus || 0,
              data_type: matchedPkg.dataType || null,
              active_type: matchedPkg.activeType || null,
              support_topup_type: matchedPkg.supportTopUpType || null,
              unused_valid_time: matchedPkg.unusedValidTime || null,
              location_network_list: locationNetworkList,
              retail_price: matchedPkg.retailPrice || null,
              currency_code: matchedPkg.currencyCode || 'USD',
              is_active: true,
              is_featured: false,
              popularity_score: 0,
              view_count: 0,
              last_synced_at: new Date().toISOString(),
              price_last_updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (importError) {
            console.error(`❌ [${logId}] Failed to auto-import ${packageCode}:`, importError);
            notFound++;
            missingPackages.push({
              package_code: packageCode,
              product_name: change.product_name,
              slug: change.slug,
              new_price_usd: newPriceUSD.toFixed(2),
              error: importError.message,
            });
            continue;
          }

          console.log(`✅ [${logId}] Auto-imported ${packageCode}: ${change.product_name}`);
          autoImported++;
          importedPackages.push({
            package_code: packageCode,
            product_name: change.product_name,
            slug: change.slug,
            location_code: locationCode,
            price_usd: newPriceUSD.toFixed(2),
            imported_at: new Date().toISOString(),
          });

          // Now continue with price update (no need to skip)

        } catch (importErr) {
          console.error(`❌ [${logId}] Exception importing ${packageCode}:`, importErr);
          notFound++;
          continue;
        }
      }

      await supabase.from('package_price_changes').insert({
        package_code: packageCode,
        old_price: oldPrice,
        new_price: newPrice,
        old_price_usd: oldPriceUSD.toFixed(2),
        new_price_usd: newPriceUSD.toFixed(2),
        change_amount: newPrice - oldPrice,
        change_percent: changePercent,
        change_source: 'price_sync',
        changed_at: change.event_timestamp || new Date().toISOString(),
      });

      const { error: updateError } = await supabase
        .from('esim_packages')
        .update({
          api_price: newPrice,
          price_last_updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        })
        .eq('package_code', packageCode);

      if (updateError) {
        console.error(`❌ [${logId}] Failed to update ${packageCode}:`, updateError);
        continue;
      }

      updated++;
      changeDetails.push({
        packageCode: packageCode,
        oldPrice: oldPriceUSD.toFixed(2),
        newPrice: newPriceUSD.toFixed(2),
        changePercent: changePercent,
      });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    await supabase
      .from('price_sync_log')
      .update({
        sync_completed_at: new Date().toISOString(),
        status: notFound > 0 ? 'partial' : 'success', // Mark as partial if import failed
        total_changes_detected: changes.length,
        packages_updated: updated,
        changes_summary: {
          duration_seconds: duration,
          not_found: notFound,
          auto_imported: autoImported,
          imported_packages: importedPackages, // Log auto-imported packages
          missing_packages: missingPackages, // Only failed imports
          changes: changeDetails.slice(0, 50),
        },
      })
      .eq('id', syncLogId);

    console.log(`✅ [${logId}] Price sync completed in ${duration}s`);
    console.log(`   📦 Updated: ${updated}`);
    console.log(`   ➕ Auto-imported: ${autoImported}`);
    console.log(`   ⚠️  Not found: ${notFound}`);

    res.json({
      success: true,
      message: 'Price sync completed',
      stats: {
        totalChanges: changes.length,
        updated,
        autoImported,
        notFound,
        durationSeconds: duration,
      },
      changes: changeDetails.slice(0, 10),
      imported: importedPackages,
    });

  } catch (error) {
    console.error(`❌ [${logId}] Price sync failed:`, error);
    console.error('Error stack:', error.stack);

    // Only update log if we have a syncLogId
    if (syncLogId) {
      await supabase
        .from('price_sync_log')
        .update({
          sync_completed_at: new Date().toISOString(),
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', syncLogId);
    }

    return res.status(500).json({
      success: false,
      error: 'Price sync failed',
      message: error.message,
      details: error.stack ? error.stack.substring(0, 200) : undefined,
    });
  }
}
