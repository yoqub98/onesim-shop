// test-cron.js
// Test script to manually trigger price sync (simulating Vercel cron)

const testPriceSync = async () => {
  console.log('🧪 Testing price sync endpoint...\n');

  try {
    // Simulating Vercel cron request (with x-vercel-cron header)
    const response = await fetch('https://onesim-shop.vercel.app/api/price-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-cron': '1', // This simulates Vercel cron
      },
      body: JSON.stringify({ days: 7 })
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response (raw):', responseText.substring(0, 500));

    let result;
    try {
      result = JSON.parse(responseText);
      console.log('Response Data:', JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('⚠️ Response is not JSON (probably HTML error page)');
      result = null;
    }

    if (response.ok && result) {
      console.log('\n✅ SUCCESS! Price sync worked!');
      console.log(`📊 Stats:
  - Total changes detected: ${result.stats?.totalChanges || 0}
  - Packages updated: ${result.stats?.updated || 0}
  - Not found in DB: ${result.stats?.notFound || 0}
  - Duration: ${result.stats?.durationSeconds || 0}s
      `);
    } else {
      console.log('\n❌ FAILED! Price sync did not work.');
      if (result) {
        console.log('Error:', result.error || result.message);
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

testPriceSync();
