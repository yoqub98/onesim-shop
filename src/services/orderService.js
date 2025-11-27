// src/services/orderService.js
// Service for handling eSIM orders

import { getTranslation } from '../config/i18n.js';

const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  return process.env.REACT_APP_PROXY_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

/**
 * Create a new eSIM order
 * @param {Object} orderData - Order details
 * @param {string} orderData.userId - User ID
 * @param {string} orderData.userEmail - User email
 * @param {string} orderData.packageCode - Package code from eSIMAccess
 * @param {string} orderData.packageName - Human readable package name
 * @param {string} orderData.countryCode - Country code (e.g., 'TR')
 * @param {string} orderData.dataAmount - Data amount (e.g., '20GB')
 * @param {number} orderData.validityDays - Validity in days
 * @param {number} orderData.priceUzs - Price in UZS
 * @param {number} orderData.priceUsd - Price in USD
 * @returns {Promise<Object>} Order creation response
 */
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create order');
    }

    return data;
  } catch (error) {
    console.error('Order creation failed:', error);
    throw error;
  }
};

/**
 * Get all orders for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user orders
 */
export const getUserOrders = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/orders/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch orders');
    }

    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    throw error;
  }
};

/**
 * Query eSIM profile data for an order
 * @param {string} orderNo - Order number from eSIMAccess
 * @returns {Promise<Object>} eSIM profile data
 */
export const queryEsimProfile = async (orderNo) => {
  try {
    const response = await fetch(`${API_URL}/esim/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNo }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to query eSIM profile');
    }

    return data;
  } catch (error) {
    console.error('eSIM query failed:', error);
    throw error;
  }
};

/**
 * Cancel an eSIM order and get refund
 * @param {string} orderId - Order ID (UUID)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelOrder = async (orderId, userId) => {
  try {
    const response = await fetch(`${API_URL}/order/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, userId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to cancel order');
    }

    return data;
  } catch (error) {
    console.error('Cancel order failed:', error);
    throw error;
  }
};

/**
 * Check and update order status by polling eSIMAccess
 * @param {string} orderId - Order ID (UUID)
 * @returns {Promise<Object>} Updated order data
 */
export const checkOrderStatus = async (orderId) => {
  try {
    const response = await fetch(`${API_URL}/order/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to check order status');
    }

    return data;
  } catch (error) {
    console.error('Check status failed:', error);
    throw error;
  }
};

/**
 * Get order status display text
 * @param {string} status - Order status
 * @param {string} lang - Language code (default: 'ru')
 * @returns {string} Translated status text
 */
export const getOrderStatusText = (status, lang = 'ru') => {
  return getTranslation(lang, `esimStatus.${status}`) || status;
};

/**
 * Get order status color for Chakra UI
 * @param {string} status - Order status
 * @returns {string} Chakra color scheme
 */
export const getOrderStatusColor = (status) => {
  const colorMap = {
    'PENDING': 'yellow',
    'PROCESSING': 'blue',
    'ALLOCATED': 'green',
    'FAILED': 'red',
    'CANCELLED': 'gray',
  };
  return colorMap[status] || 'gray';
};

/**
 * Check if eSIM should show usage data
 * Based on eSIMAccess API documentation:
 * - GOT_RESOURCE + RELEASED = New (not installed) - NO usage
 * - GOT_RESOURCE + ENABLED = Onboard (installed) - YES usage
 * - IN_USE = Active - YES usage
 * - USED_UP = Depleted - YES usage
 * - USED_EXPIRED = Expired - NO usage (plan ended)
 * - CANCEL = Cancelled - NO usage
 * - DELETED = Deleted - NO usage
 * 
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API
 * @returns {boolean} Whether to show usage data
 */
export const shouldShowUsage = (esimStatus, smdpStatus) => {
  // Don't show usage for deleted eSIMs
  if (smdpStatus === 'DELETED') {
    return false;
  }

  // Show usage for these statuses (eSIM is/was in use)
  const usageStatuses = ['IN_USE', 'USED_UP'];
  if (usageStatuses.includes(esimStatus)) {
    return true;
  }

  // For GOT_RESOURCE, only show usage if installed (not RELEASED)
  if (esimStatus === 'GOT_RESOURCE' && smdpStatus !== 'RELEASED') {
    return true;
  }

  return false;
};

/**
 * Check if eSIM can be cancelled
 * Cancel is only available when eSIM is not installed:
 * - esimStatus = GOT_RESOURCE
 * - smdpStatus = RELEASED
 * 
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API
 * @returns {boolean} Whether eSIM can be cancelled
 */
export const canCancelEsim = (esimStatus, smdpStatus) => {
  return esimStatus === 'GOT_RESOURCE' && smdpStatus === 'RELEASED';
};

/**
 * Get eSIM status display text
 * Based on eSIMAccess API documentation:
 * 
 * Status Matrix:
 * | eSIM Status    | smdpStatus           | esimStatus      | Meaning           |
 * |----------------|----------------------|-----------------|-------------------|
 * | New            | RELEASED             | GOT_RESOURCE    | Ready to install  |
 * | Onboard        | ENABLED              | IN_USE/GOT_RES  | Installed         |
 * | In Use         | ENABLED/DISABLED     | IN_USE          | Active usage      |
 * | Depleted       | ENABLED/DISABLED     | USED_UP         | Data exhausted    |
 * | Expired        | -                    | USED_EXPIRED    | Validity ended    |
 * | Cancelled      | -                    | CANCEL          | Cancelled         |
 * | Deleted        | DELETED              | -               | Removed           |
 * 
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API (optional)
 * @param {string} lang - Language code (default: 'ru')
 * @returns {string} Translated eSIM status text
 */
export const getEsimStatusText = (esimStatus, smdpStatus, lang = 'ru') => {
  if (!esimStatus) return null;

  // Handle DELETED smdpStatus first (highest priority)
  if (smdpStatus === 'DELETED') {
    return getTranslation(lang, 'esimStatus.DELETED');
  }

  // Handle GOT_RESOURCE with different smdpStatus
  if (esimStatus === 'GOT_RESOURCE') {
    if (smdpStatus === 'RELEASED') {
      // New - ready to install, not yet on device
      return getTranslation(lang, 'esimStatus.GOT_RESOURCE_RELEASED');
    } else {
      // Onboard - installed on device (ENABLED, DISABLED, or INSTALLATION)
      return getTranslation(lang, 'esimStatus.GOT_RESOURCE_INSTALLED');
    }
  }

  // Handle IN_USE status
  if (esimStatus === 'IN_USE') {
    return getTranslation(lang, 'esimStatus.IN_USE');
  }

  // Handle USED_UP status (data depleted)
  if (esimStatus === 'USED_UP') {
    return getTranslation(lang, 'esimStatus.USED_UP');
  }

  // Handle USED_EXPIRED status (validity ended)
  if (esimStatus === 'USED_EXPIRED') {
    return getTranslation(lang, 'esimStatus.USED_EXPIRED');
  }

  // Handle CANCEL status
  if (esimStatus === 'CANCEL') {
    return getTranslation(lang, 'esimStatus.CANCEL');
  }

  // Fallback - return the raw status
  return getTranslation(lang, `esimStatus.${esimStatus}`) || esimStatus;
};

/**
 * Get eSIM status color for Chakra UI
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API (optional)
 * @returns {string} Chakra color scheme
 */
export const getEsimStatusColor = (esimStatus, smdpStatus) => {
  if (!esimStatus) return 'gray';

  // Deleted - red
  if (smdpStatus === 'DELETED') {
    return 'red';
  }

  // GOT_RESOURCE - depends on smdpStatus
  if (esimStatus === 'GOT_RESOURCE') {
    if (smdpStatus === 'RELEASED') {
      return 'blue'; // Ready to install
    }
    return 'green'; // Installed
  }

  // Status color map
  const colorMap = {
    'IN_USE': 'purple',      // Active - purple
    'USED_UP': 'orange',     // Depleted - orange
    'USED_EXPIRED': 'red',   // Expired - red
    'CANCEL': 'gray',        // Cancelled - gray
  };

  return colorMap[esimStatus] || 'gray';
};

/**
 * Query eSIM usage data by order number
 * This makes two API calls on the backend:
 * 1. First gets esimTranNo from /esim/query using orderNo
 * 2. Then queries usage data from /esim/usage/query using esimTranNo
 * 
 * @param {string} orderNo - Order number from eSIMAccess (e.g., "B25112216380014")
 * @returns {Promise<Object>} Usage data including totalVolume and orderUsage in bytes
 */
export const queryEsimUsage = async (orderNo) => {
  try {
    console.log('📊 [SERVICE] Querying usage for orderNo:', orderNo);
    
    const response = await fetch(`${API_URL}/esim/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNo }),
    });

    const data = await response.json();
    
    console.log('📊 [SERVICE] Usage response:', {
      success: data.success,
      hasEsimList: !!data.obj?.esimList,
      esimCount: data.obj?.esimList?.length || 0
    });

    if (!response.ok) {
      console.error('📊 [SERVICE] HTTP error:', response.status);
      throw new Error(data.error || 'Failed to query eSIM usage');
    }

    if (!data.success) {
      console.error('📊 [SERVICE] API error:', data.error || data.errorMsg);
      throw new Error(data.error || data.errorMsg || 'Failed to query eSIM usage');
    }

    return data;
  } catch (error) {
    console.error('📊 [SERVICE] eSIM usage query failed:', error);
    throw error;
  }
};
