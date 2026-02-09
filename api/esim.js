// api/esim.js - Consolidated eSIM API endpoint
// Handles all eSIM-related operations to reduce serverless function count

const ESIMACCESS_API_URL = 'https://api.esimaccess.com/api/v1/open';
const ESIMACCESS_API_KEY = process.env.REACT_APP_ESIMACCESS_API_KEY;

// Route: POST /api/esim?action=query - Query eSIM profile
async function queryEsimProfile(req, res) {
  const { orderNo, iccid, esimTranNo } = req.body;

  console.log('🔍 [ESIM-QUERY] Request:', { orderNo, iccid, esimTranNo });

  if (!orderNo && !iccid && !esimTranNo) {
    return res.status(400).json({
      success: false,
      error: 'At least one of orderNo, iccid, or esimTranNo is required',
    });
  }

  try {
    const requestBody = {};
    if (orderNo) requestBody.orderNo = orderNo;
    if (iccid) requestBody.iccid = iccid;
    if (esimTranNo) requestBody.esimTranNo = esimTranNo;

    const response = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `query_${Date.now()}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('📥 [ESIM-QUERY] Response:', {
      success: data.success,
      hasEsimList: !!data.obj?.esimList,
      count: data.obj?.esimList?.length || 0,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.errorMsg || 'Failed to query eSIM',
        errorCode: data.errorCode,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ [ESIM-QUERY] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Route: POST /api/esim?action=usage - Query eSIM usage data
async function queryEsimUsage(req, res) {
  const { orderNo } = req.body;

  console.log('📊 [ESIM-USAGE] Request:', { orderNo });

  if (!orderNo) {
    return res.status(400).json({
      success: false,
      error: 'orderNo is required',
    });
  }

  try {
    // First, get esimTranNo from /esim/query
    const queryResponse = await fetch(`${ESIMACCESS_API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `usage_query_${Date.now()}`,
      },
      body: JSON.stringify({ orderNo }),
    });

    const queryData = await queryResponse.json();

    if (!queryData.success || !queryData.obj?.esimList?.[0]) {
      return res.status(404).json({
        success: false,
        error: 'eSIM not found',
      });
    }

    const esimTranNo = queryData.obj.esimList[0].esimTranNo;

    // Then query usage data
    const usageResponse = await fetch(`${ESIMACCESS_API_URL}/esim/usage/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `usage_${Date.now()}`,
      },
      body: JSON.stringify({ esimTranNo }),
    });

    const usageData = await usageResponse.json();

    console.log('📊 [ESIM-USAGE] Response:', {
      success: usageData.success,
      hasEsimList: !!usageData.obj?.esimList,
    });

    if (!usageResponse.ok) {
      return res.status(usageResponse.status).json({
        success: false,
        error: usageData.errorMsg || 'Failed to query usage',
        errorCode: usageData.errorCode,
      });
    }

    return res.status(200).json(usageData);
  } catch (error) {
    console.error('❌ [ESIM-USAGE] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Route: POST /api/esim?action=suspend - Suspend eSIM
async function suspendEsim(req, res) {
  const { iccid } = req.body;

  console.log('⏸️ [ESIM-SUSPEND] Request:', { iccid });

  if (!iccid) {
    return res.status(400).json({
      success: false,
      error: 'iccid is required',
    });
  }

  try {
    const response = await fetch(`${ESIMACCESS_API_URL}/esim/suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `suspend_${Date.now()}`,
      },
      body: JSON.stringify({ iccid }),
    });

    const data = await response.json();

    console.log('⏸️ [ESIM-SUSPEND] Response:', { success: data.success });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.errorMsg || 'Failed to suspend eSIM',
        errorCode: data.errorCode,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ [ESIM-SUSPEND] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Route: POST /api/esim?action=cancel - Cancel eSIM profile
async function cancelEsimProfile(req, res) {
  const { esimTranNo } = req.body;

  console.log('🚫 [ESIM-CANCEL] Request:', { esimTranNo });

  if (!esimTranNo) {
    return res.status(400).json({
      success: false,
      error: 'esimTranNo is required',
    });
  }

  try {
    const response = await fetch(`${ESIMACCESS_API_URL}/esim/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-AccessKey': ESIMACCESS_API_KEY,
        'RT-RequestID': `cancel_${Date.now()}`,
      },
      body: JSON.stringify({ esimTranNo }),
    });

    const data = await response.json();

    console.log('🚫 [ESIM-CANCEL] Response:', { success: data.success });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.errorMsg || 'Failed to cancel eSIM',
        errorCode: data.errorCode,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ [ESIM-CANCEL] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
}

// Main router
export default async function handler(req, res) {
  const { action } = req.query;

  console.log('🔄 [ESIM] Request:', req.method, action);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    switch (action) {
      case 'query':
        return await queryEsimProfile(req, res);
      case 'usage':
        return await queryEsimUsage(req, res);
      case 'suspend':
        return await suspendEsim(req, res);
      case 'cancel':
        return await cancelEsimProfile(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action parameter. Use: query, usage, suspend, or cancel' });
    }
  } catch (error) {
    console.error('❌ [ESIM] Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
