// test-endpoint.js - Test the simple test endpoint
const testEndpoint = async () => {
  console.log('🧪 Testing simple test endpoint...\n');

  try {
    const response = await fetch('https://onesim-shop.vercel.app/api/test-sync');
    const result = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Test endpoint works!');
    } else {
      console.log('\n❌ Test endpoint failed!');
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

testEndpoint();
