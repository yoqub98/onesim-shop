// server.js - Proxy server for esimAccess API
// Fixed CORS and Express routing

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Supabase client with service role for backend operations
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// eSIMAccess API configuration
const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// Email transporter (configure with your SMTP settings)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper: Generate unique transaction ID
const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// CORS configuration - must be BEFORE other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Proxy endpoint for package list
app.post('/api/packages', async (req, res) => {
  try {
    console.log('📦 Fetching packages for:', req.body.locationCode || 'all countries');
    
    const response = await fetch('https://api.esimaccess.com/api/v1/open/package/list', {
      method: 'POST',
      headers: {
        'RT-AccessCode': process.env.REACT_APP_ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched', data.obj?.packageList?.length || 0, 'packages');
    res.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch packages',
      message: error.message 
    });
  }
});

// =========================================
// ORDER ENDPOINTS
// =========================================

// Create eSIM order
app.post('/api/order', async (req, res) => {
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
          price: Math.round(priceUsd * 10000) // Convert to API format
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
});

// Query eSIM profile data
app.post('/api/esim/query', async (req, res) => {
  try {
    const { orderNo } = req.body;

    if (!orderNo) {
      return res.status(400).json({ success: false, error: 'orderNo is required' });
    }

    console.log('🔍 Querying eSIM profile for order:', orderNo);

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNo }),
    });

    const data = await response.json();
    console.log('📄 eSIM query response:', data);

    res.json(data);
  } catch (error) {
    console.error('❌ eSIM query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Query eSIM usage data by eSIM transaction number (order_no)
app.post('/api/esim/usage', async (req, res) => {
  try {
    const { esimTranNo } = req.body;

    if (!esimTranNo) {
      return res.status(400).json({ success: false, error: 'esimTranNo is required' });
    }

    console.log('📊 Querying eSIM usage for esimTranNo:', esimTranNo);

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/usage/query`, {
      method: 'POST',
      headers: {
        'RT-AccessCode': ESIMACCESS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        esimTranNoList: [esimTranNo]
      }),
    });

    const data = await response.json();
    console.log('📊 eSIM usage response:', data);

    // Transform the response to match the expected format
    if (data.success && data.obj?.esimUsageList && data.obj.esimUsageList.length > 0) {
      const usageInfo = data.obj.esimUsageList[0];

      // Return formatted data with proper field names
      return res.json({
        success: true,
        obj: {
          esimList: [{
            totalVolume: usageInfo.totalData,      // Total data in bytes
            orderUsage: usageInfo.dataUsage,       // Used data in bytes
            lastUpdateTime: usageInfo.lastUpdateTime
          }]
        }
      });
    }

    res.json(data);
  } catch (error) {
    console.error('❌ eSIM usage query error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint for eSIMAccess callbacks
app.post('/api/webhook/esim', async (req, res) => {
  try {
    console.log('📥 Webhook received:', JSON.stringify(req.body, null, 2));

    const { orderNo, esimList, notifyType } = req.body;

    if (!orderNo) {
      return res.status(400).json({ success: false, error: 'Invalid webhook payload' });
    }

    // Find the order in database
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_no', orderNo)
      .single();

    if (findError || !order) {
      console.error('❌ Order not found for webhook:', orderNo);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // If eSIM data is in webhook, update directly
    if (esimList && esimList.length > 0) {
      const esim = esimList[0];

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          order_status: 'ALLOCATED',
          iccid: esim.iccid,
          qr_code_url: esim.qrCodeUrl,
          qr_code_data: esim.ac,
          smdp_address: esim.smdpAddress,
          activation_code: esim.ac,
          esim_status: esim.esimStatus
        })
        .eq('order_no', orderNo);

      if (updateError) {
        console.error('❌ Failed to update order:', updateError);
        throw updateError;
      }

      // Send email to user
      await sendEsimEmail(order, esim);

      console.log('✅ Order updated with eSIM data:', orderNo);
    } else {
      // Query eSIMAccess for profile data
      const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
        method: 'POST',
        headers: {
          'RT-AccessCode': ESIMACCESS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderNo }),
      });

      const queryData = await queryResponse.json();
      console.log('📄 Queried eSIM data:', queryData);

      if (queryData.success && queryData.obj?.esimList?.length > 0) {
        const esim = queryData.obj.esimList[0];

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            order_status: 'ALLOCATED',
            iccid: esim.iccid,
            qr_code_url: esim.qrCodeUrl,
            qr_code_data: esim.ac,
            smdp_address: esim.smdpAddress,
            activation_code: esim.ac,
            esim_status: esim.esimStatus
          })
          .eq('order_no', orderNo);

        if (!updateError) {
          await sendEsimEmail(order, esim);
        }
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Send eSIM email to user
async function sendEsimEmail(order, esim) {
  try {
    // Get user email from Supabase auth
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
    const userEmail = userData?.user?.email;

    if (!userEmail) {
      console.error('❌ No email found for user:', order.user_id);
      return;
    }

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">OneSIM</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Ваш eSIM готов к активации!</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
          <h2 style="color: #1a202c; margin-top: 0;">Детали заказа</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">Номер заказа:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${order.order_no}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">Пакет:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${order.package_name || order.package_code}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #718096;">ICCID:</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${esim.iccid}</td>
            </tr>
          </table>

          <div style="background: #f7fafc; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 15px 0; color: #4a5568; font-weight: 600;">QR-код для активации:</p>
            ${esim.qrCodeUrl ? `<img src="${esim.qrCodeUrl}" alt="QR Code" style="max-width: 200px; height: auto;">` : `<p style="font-family: monospace; word-break: break-all; background: #edf2f7; padding: 10px; border-radius: 8px;">${esim.ac}</p>`}
          </div>

          <h3 style="color: #1a202c;">Инструкция по установке:</h3>
          <ol style="color: #4a5568; line-height: 1.8;">
            <li>Откройте <strong>Настройки</strong> на вашем телефоне</li>
            <li>Перейдите в раздел <strong>Сотовая связь / Мобильные данные</strong></li>
            <li>Выберите <strong>Добавить eSIM</strong> или <strong>Добавить тарифный план</strong></li>
            <li>Отсканируйте QR-код выше</li>
            <li>Подтвердите установку профиля</li>
            <li>Активируйте eSIM и начните использовать!</li>
          </ol>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Важно:</strong> Сохраните это письмо. QR-код можно использовать только один раз.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #718096; font-size: 12px;">
          <p>© 2025 OneSIM. Все права защищены.</p>
        </div>
      </div>
    `;

    await emailTransporter.sendMail({
      from: `"OneSIM" <${process.env.SMTP_USER || 'noreply@onesim.com'}>`,
      to: userEmail,
      subject: 'Ваш eSIM готов к активации - OneSIM',
      html: emailHtml,
    });

    // Update email_sent status
    await supabase
      .from('orders')
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq('id', order.id);

    console.log('✅ Email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
  }
}

// Get user orders
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('❌ Get orders error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Proxy server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'esimAccess Proxy Server',
    endpoints: {
      health: 'GET /api/health',
      packages: 'POST /api/packages',
      order: 'POST /api/order',
      esimQuery: 'POST /api/esim/query',
      webhook: 'POST /api/webhook/esim',
      userOrders: 'GET /api/orders/:userId'
    }
  });
});

app.listen(PORT, () => {
  console.log('\n🚀 Proxy server started successfully!');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`✅ CORS enabled for: localhost:3000, 3001, 3002`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/packages`);
  console.log('\n');
});