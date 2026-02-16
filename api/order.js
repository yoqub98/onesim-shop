// api/order.js - Vercel serverless function for creating eSIM orders
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export default async function handler(req, res) {
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
    const {
      userId, userEmail, packageCode, packageName, countryCode, dataAmount, validityDays, priceUzs, priceUsd,
      // B2C fields (optional but recommended)
      source_type, end_customer_id, end_customer_type, discount_applicable
    } = req.body;

    console.log('🛒 [ORDER] New order request received');
    console.log('🛒 [ORDER] User:', { userId, userEmail });
    console.log('🛒 [ORDER] Package:', { packageCode, packageName, countryCode });
    console.log('🛒 [ORDER] Pricing:', { priceUzs, priceUsd });

    if (!userId || !packageCode) {
      console.error('❌ [ORDER] Missing required fields');
      return res.status(400).json({ success: false, error: 'Missing required fields: userId and packageCode' });
    }

    const transactionId = generateTransactionId();
    console.log('🔑 [ORDER] Generated transactionId:', transactionId);

    // Create order in eSIMAccess
    console.log('📡 [ORDER] Calling eSIMAccess API...');
    const esimRequestBody = {
      transactionId,
      packageInfoList: [{
        packageCode,
        count: 1,
        price: Math.round(priceUsd * 10000)
      }]
    };
    console.log('📡 [ORDER] eSIMAccess request:', JSON.stringify(esimRequestBody));

    const orderResponse = await fetch(`${ESIMACCESS_API_URL}/esim/order`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(esimRequestBody),
    });

    const orderData = await orderResponse.json();
    console.log('📬 [ORDER] eSIMAccess response:', JSON.stringify(orderData));

    if (!orderData.success) {
      console.error('❌ [ORDER] eSIMAccess error:', orderData.errorMsg);
      throw new Error(orderData.errorMsg || 'Failed to create order');
    }

    const orderNo = orderData.obj?.orderNo;
    console.log('✅ [ORDER] Got orderNo:', orderNo);

    // Save order to Supabase
    console.log('💾 [ORDER] Saving to Supabase...');
    const { data: dbOrder, error: dbError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        // B2C fields for clarity and future-proofing
        source_type: source_type || 'b2c',
        end_customer_id: end_customer_id || userId,
        end_customer_type: end_customer_type || 'b2c',
        discount_applicable: discount_applicable ?? false,
        // Standard order fields
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
      console.error('❌ [ORDER] Supabase insert error:', dbError);
      throw new Error('Failed to save order to database');
    }

    console.log('✅ [ORDER] Order saved to Supabase:', { id: dbOrder.id, orderNo, transactionId });
    console.log('🎉 [ORDER] Order creation complete!');

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
    console.error('❌ [ORDER] FATAL ERROR:', error.message);
    console.error('❌ [ORDER] Stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
};
