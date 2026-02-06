// api/sync-status.js
// Get the latest price sync log status
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

  // Diagnostic mode: ?test=1
  const isTestMode = req.query.test === '1';

  try {
    // In test mode, return diagnostic info
    if (isTestMode) {
      const envCheck = {
        supabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
        supabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY),
        esimAccessKey: !!(process.env.ESIMACCESS_API_KEY || process.env.REACT_APP_ESIMACCESS_API_KEY),
        syncSecretKey: !!process.env.SYNC_SECRET_KEY,
      };

      return res.json({
        success: true,
        message: 'Diagnostic mode',
        environment: envCheck,
        timestamp: new Date().toISOString(),
      });
    }
    // Fetch the latest sync log entry
    const { data: latestSync, error } = await supabase
      .from('price_sync_log')
      .select('*')
      .order('sync_started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Failed to fetch sync status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch sync status',
      });
    }

    if (!latestSync) {
      return res.json({
        success: true,
        data: null,
        message: 'No sync history found',
      });
    }

    // Calculate how long ago the sync happened
    const syncTime = new Date(latestSync.sync_completed_at || latestSync.sync_started_at);
    const now = new Date();
    const hoursAgo = Math.floor((now - syncTime) / (1000 * 60 * 60));
    const minutesAgo = Math.floor((now - syncTime) / (1000 * 60));

    return res.json({
      success: true,
      data: {
        status: latestSync.status,
        lastSyncAt: latestSync.sync_completed_at || latestSync.sync_started_at,
        totalChangesDetected: latestSync.total_changes_detected || 0,
        packagesUpdated: latestSync.packages_updated || 0,
        hoursAgo,
        minutesAgo,
        errorMessage: latestSync.error_message,
      },
    });

  } catch (error) {
    console.error('❌ Sync status endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
}
