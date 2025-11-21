// api/order.js - Vercel serverless function for creating eSIM orders
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail, packageCode, packageName, countryCode, dataAmount, validityDays, priceUzs, priceUsd } = req.body;

    if (!userId || !packageCode) {
      return res.status(400).json({ success: false, error: 'Missing required fields: userId and packageCode' });
    }

    const transactionId = generateTransactionId();
    console.log('📦 Creating eSIM order:', { transactionId, packageCode, userId });

    // Create order in eSIMAccess
    const orderResponse = await fetch(`${ESIMACCESS_API_URL}/esim/order`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        packageInfoList: [{
          packageCode,
          count: 1,
          price: Math.round(priceUsd * 10000)
        }]
      }),
    });

    const orderData = await orderResponse.json();
    console.log('📬 eSIMAccess order response:', orderData);

    if (!orderData.success) {
      throw new Error(orderData.errorMsg || 'Failed to create order');
    }

    const orderNo = orderData.obj?.orderNo;

    // Save order to Supabase
    const { data: dbOrder, error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_no: orderNo,
        transaction_id: transactionId,
        package_code: packageCode,
        package_name: packageName,
        country_code: countryCode,
        data_amount: dataAmount,
        validity_days: validityDays,
        price_uzs: priceUzs,
        price_usd: priceUsd,
        order_status: 'PENDING'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error('Failed to save order to database');
    }

    console.log('✅ Order created successfully:', { orderNo, transactionId, dbId: dbOrder.id });

    res.json({
      success: true,
      data: {
        orderId: dbOrder.id,
        orderNo,
        transactionId,
        status: 'PENDING',
        message: 'Order created successfully. eSIM will be allocated shortly.'
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
