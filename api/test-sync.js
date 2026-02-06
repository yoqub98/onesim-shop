// api/test-sync.js
// Simple test endpoint to verify sync infrastructure works
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

  try {
    console.log('🧪 Test sync endpoint called');

    // Test 1: Supabase connection
    const { data: testData, error: dbError } = await supabase
      .from('price_sync_log')
      .select('id')
      .limit(1);

    if (dbError) {
      throw new Error(`Supabase connection failed: ${dbError.message}`);
    }

    // Test 2: Check environment variables
    const envCheck = {
      supabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
      supabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY),
      esimAccessKey: !!(process.env.ESIMACCESS_API_KEY || process.env.REACT_APP_ESIMACCESS_API_KEY),
      syncSecretKey: !!process.env.SYNC_SECRET_KEY,
    };

    // Test 3: Get latest sync log
    const { data: latestSync } = await supabase
      .from('price_sync_log')
      .select('*')
      .order('sync_started_at', { ascending: false })
      .limit(1)
      .single();

    return res.json({
      success: true,
      message: 'All tests passed!',
      tests: {
        supabaseConnection: '✅ Connected',
        environmentVariables: envCheck,
        latestSyncLog: latestSync ? {
          date: latestSync.sync_started_at,
          status: latestSync.status,
          packagesUpdated: latestSync.packages_updated || 0,
        } : 'No sync logs found',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
