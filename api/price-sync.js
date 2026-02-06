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

  if (!isVercelCron && (!authHeader || authHeader !== `Bearer ${process.env.SYNC_SECRET_KEY}`)) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const startTime = Date.now();
  const logId = `sync_${Date.now()}`;

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
    }

    const syncLogId = syncLog?.id;
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

    if (!response.ok) {
      throw new Error(`Price history API returned ${response.status}`);
    }

    const priceData = await response.json();

    if (!priceData.success || !priceData.data) {
      throw new Error('Invalid price history response');
    }

    const changes = priceData.data;
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
    const changeDetails = [];

    for (const change of changes) {
      const oldPriceUSD = (change.oldPrice / 10000).toFixed(2);
      const newPriceUSD = (change.newPrice / 10000).toFixed(2);
      const changePercent = (((change.newPrice - change.oldPrice) / change.oldPrice) * 100).toFixed(2);

      console.log(
        `📝 [${logId}] ${change.packageCode}: $${oldPriceUSD} → $${newPriceUSD} (${changePercent >= 0 ? '+' : ''}${changePercent}%)`
      );

      const { data: existingPkg } = await supabase
        .from('esim_packages')
        .select('package_code, api_price')
        .eq('package_code', change.packageCode)
        .single();

      if (!existingPkg) {
        console.warn(`⚠️  [${logId}] Package ${change.packageCode} not found in DB`);
        notFound++;
        continue;
      }

      await supabase.from('package_price_changes').insert({
        package_code: change.packageCode,
        old_price: change.oldPrice,
        new_price: change.newPrice,
        old_price_usd: oldPriceUSD,
        new_price_usd: newPriceUSD,
        change_amount: change.newPrice - change.oldPrice,
        change_percent: changePercent,
        change_source: 'price_sync',
        changed_at: change.changedAt || new Date().toISOString(),
      });

      const { error: updateError } = await supabase
        .from('esim_packages')
        .update({
          api_price: change.newPrice,
          price_last_updated_at: new Date().toISOString(),
          last_synced_at: new Date().toISOString(),
        })
        .eq('package_code', change.packageCode);

      if (updateError) {
        console.error(`❌ [${logId}] Failed to update ${change.packageCode}:`, updateError);
        continue;
      }

      updated++;
      changeDetails.push({
        packageCode: change.packageCode,
        oldPrice: oldPriceUSD,
        newPrice: newPriceUSD,
        changePercent: changePercent,
      });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    await supabase
      .from('price_sync_log')
      .update({
        sync_completed_at: new Date().toISOString(),
        status: 'success',
        total_changes_detected: changes.length,
        packages_updated: updated,
        changes_summary: {
          duration_seconds: duration,
          not_found: notFound,
          changes: changeDetails.slice(0, 50),
        },
      })
      .eq('id', syncLogId);

    console.log(`✅ [${logId}] Price sync completed in ${duration}s`);
    console.log(`   📦 Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);

    res.json({
      success: true,
      message: 'Price sync completed',
      stats: {
        totalChanges: changes.length,
        updated,
        notFound,
        durationSeconds: duration,
      },
      changes: changeDetails.slice(0, 10),
    });

  } catch (error) {
    console.error(`❌ [${logId}] Price sync failed:`, error);

    await supabase
      .from('price_sync_log')
      .update({
        sync_completed_at: new Date().toISOString(),
        status: 'failed',
        error_message: error.message,
      })
      .eq('id', syncLogId);

    res.status(500).json({
      success: false,
      error: 'Price sync failed',
      message: error.message,
    });
  }
}
