// server.js - Proxy server for esimAccess API
// Fixed CORS and Express routing

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

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
      packages: 'POST /api/packages'
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