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
 * @param {boolean} live - If true, fetch live status from eSIM Access API
 * @returns {Promise<Array>} Array of user orders
 */
export const getUserOrders = async (userId, live = false) => {
  try {
    const url = live
      ? `${API_URL}/orders?userId=${userId}&live=true`
      : `${API_URL}/orders?userId=${userId}`;

    console.log('📥 [getUserOrders] Fetching orders with live=' + live);

    const response = await fetch(url, {
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
 * Returns LIVE status from eSIMAccess API
 * @param {string} orderNo - Order number from eSIMAccess
 * @returns {Promise<Object>} eSIM profile data with current status
 */
export const queryEsimProfile = async (orderNo) => {
  try {
    console.log('🔍 [SERVICE] Querying eSIM profile for orderNo:', orderNo);

    const response = await fetch(`${API_URL}/esim?action=query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderNo }),
    });

    const data = await response.json();

    console.log('🔍 [SERVICE] Profile response:', {
      success: data.success,
      hasEsimList: !!data.obj?.esimList,
      esimCount: data.obj?.esimList?.length || 0
    });

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
    const response = await fetch(`${API_URL}/orders?action=cancel`, {
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
    const response = await fetch(`${API_URL}/orders?action=check-status`, {
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
 * 
 * Status Matrix (from API):
 * | eSIM Status    | smdpStatus           | esimStatus      | Show Usage? |
 * |----------------|----------------------|-----------------|-------------|
 * | New            | RELEASED             | GOT_RESOURCE    | NO          |
 * | Onboard        | ENABLED/INSTALLATION | GOT_RESOURCE    | YES         |
 * | In Use         | ENABLED/DISABLED     | IN_USE          | YES         |
 * | Depleted       | ENABLED/DISABLED     | USED_UP         | YES (100%)  |
 * | Expired        | -                    | USED_EXPIRED    | YES (show)  |
 * | Cancelled      | -                    | CANCEL          | NO          |
 * | Deleted        | DELETED              | -               | NO          |
 * 
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API
 * @returns {boolean} Whether to show usage data
 */
export const shouldShowUsage = (esimStatus, smdpStatus) => {
  console.log('📊 [shouldShowUsage] Checking:', { esimStatus, smdpStatus });
  
  // Don't show usage for deleted eSIMs
  if (smdpStatus === 'DELETED') {
    console.log('📊 [shouldShowUsage] DELETED -> false');
    return false;
  }

  // Don't show usage for cancelled eSIMs
  if (esimStatus === 'CANCEL') {
    console.log('📊 [shouldShowUsage] CANCEL -> false');
    return false;
  }

  // Show usage for IN_USE (active eSIM)
  if (esimStatus === 'IN_USE') {
    console.log('📊 [shouldShowUsage] IN_USE -> true');
    return true;
  }

  // Show usage for USED_UP (depleted - 100% used)
  if (esimStatus === 'USED_UP') {
    console.log('📊 [shouldShowUsage] USED_UP -> true');
    return true;
  }

  // Show usage for USED_EXPIRED (expired but had usage)
  if (esimStatus === 'USED_EXPIRED') {
    console.log('📊 [shouldShowUsage] USED_EXPIRED -> true');
    return true;
  }

  // For GOT_RESOURCE, check smdpStatus
  if (esimStatus === 'GOT_RESOURCE') {
    // RELEASED means not installed yet - no usage to show
    if (smdpStatus === 'RELEASED') {
      console.log('📊 [shouldShowUsage] GOT_RESOURCE + RELEASED -> false');
      return false;
    }
    // ENABLED, DISABLED, or INSTALLATION means installed - show usage
    console.log('📊 [shouldShowUsage] GOT_RESOURCE + ' + smdpStatus + ' -> true');
    return true;
  }

  console.log('📊 [shouldShowUsage] Default -> false');
  return false;
};

/**
 * Check if eSIM can be cancelled
 * Cancel is only available when eSIM is not installed:
 * - esimStatus = GOT_RESOURCE
 * - smdpStatus = RELEASED
 * 
 * Once installed or used, cannot be cancelled.
 * 
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API
 * @returns {boolean} Whether eSIM can be cancelled
 */
export const canCancelEsim = (esimStatus, smdpStatus) => {
  console.log('🚫 [canCancelEsim] Checking:', { esimStatus, smdpStatus });
  
  const canCancel = esimStatus === 'GOT_RESOURCE' && smdpStatus === 'RELEASED';
  
  console.log('🚫 [canCancelEsim] Result:', canCancel);
  return canCancel;
};

/**
 * Get eSIM status display text
 * Based on eSIMAccess API documentation:
 * 
 * Status Matrix:
 * | eSIM Status    | smdpStatus           | esimStatus      | Display Text Key      |
 * |----------------|----------------------|-----------------|----------------------|
 * | New            | RELEASED             | GOT_RESOURCE    | GOT_RESOURCE_RELEASED |
 * | Onboard        | ENABLED/etc          | GOT_RESOURCE    | GOT_RESOURCE_INSTALLED|
 * | In Use         | ENABLED/DISABLED     | IN_USE          | IN_USE               |
 * | Depleted       | ENABLED/DISABLED     | USED_UP         | USED_UP              |
 * | Expired        | -                    | USED_EXPIRED    | USED_EXPIRED         |
 * | Cancelled      | -                    | CANCEL          | CANCEL               |
 * | Deleted        | DELETED              | -               | DELETED              |
 * 
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @param {string} smdpStatus - SM-DP+ status from eSIMAccess API (optional)
 * @param {string} lang - Language code (default: 'ru')
 * @returns {string} Translated eSIM status text
 */
export const getEsimStatusText = (esimStatus, smdpStatus, lang = 'ru') => {
  if (!esimStatus) return null;

  console.log('🏷️ [getEsimStatusText] Getting text for:', { esimStatus, smdpStatus, lang });

  // Handle DELETED smdpStatus first (highest priority)
  if (smdpStatus === 'DELETED') {
    return getTranslation(lang, 'esimStatus.DELETED');
  }

  // Handle CANCEL status
  if (esimStatus === 'CANCEL') {
    return getTranslation(lang, 'esimStatus.CANCEL');
  }

  // Handle USED_UP status (depleted)
  if (esimStatus === 'USED_UP') {
    return getTranslation(lang, 'esimStatus.USED_UP');
  }

  // Handle USED_EXPIRED status
  if (esimStatus === 'USED_EXPIRED') {
    return getTranslation(lang, 'esimStatus.USED_EXPIRED');
  }

  // Handle IN_USE status
  if (esimStatus === 'IN_USE') {
    return getTranslation(lang, 'esimStatus.IN_USE');
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

  // Fallback - return the raw status or try to translate it
  const translated = getTranslation(lang, `esimStatus.${esimStatus}`);
  return translated !== `esimStatus.${esimStatus}` ? translated : esimStatus;
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

  // Cancelled - gray
  if (esimStatus === 'CANCEL') {
    return 'gray';
  }

  // Used up (depleted) - orange
  if (esimStatus === 'USED_UP') {
    return 'orange';
  }

  // Expired - red
  if (esimStatus === 'USED_EXPIRED') {
    return 'red';
  }

  // In Use - purple (active)
  if (esimStatus === 'IN_USE') {
    return 'purple';
  }

  // GOT_RESOURCE - depends on smdpStatus
  if (esimStatus === 'GOT_RESOURCE') {
    if (smdpStatus === 'RELEASED') {
      return 'blue'; // Ready to install
    }
    return 'green'; // Installed
  }

  return 'gray';
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

    const response = await fetch(`${API_URL}/esim?action=usage`, {
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

/**
 * Suspend/pause an eSIM profile
 * This operation pauses the data service for an active eSIM.
 *
 * @param {string} iccid - ICCID of the eSIM to suspend
 * @returns {Promise<Object>} Suspend response
 */
export const suspendEsim = async (iccid) => {
  try {
    console.log('⏸️ [SERVICE] Suspending eSIM:', iccid);

    const response = await fetch(`${API_URL}/esim?action=suspend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ iccid }),
    });

    const data = await response.json();

    console.log('⏸️ [SERVICE] Suspend response:', data);

    if (!response.ok) {
      console.error('⏸️ [SERVICE] HTTP error:', response.status);
      throw new Error(data.error || 'Failed to suspend eSIM');
    }

    if (!data.success) {
      console.error('⏸️ [SERVICE] API error:', data.errorMsg);
      throw new Error(data.errorMsg || 'Failed to suspend eSIM');
    }

    return data;
  } catch (error) {
    console.error('⏸️ [SERVICE] eSIM suspend failed:', error);
    throw error;
  }
};

/**
 * Cancel an eSIM profile
 * This operation cancels an unused eSIM profile.
 * Only available when esimStatus is GOT_RESOURCE and smdpStatus is RELEASED.
 *
 * @param {string} esimTranNo - eSIM transaction number
 * @returns {Promise<Object>} Cancel response
 */
export const cancelEsimProfile = async (esimTranNo) => {
  try {
    console.log('🚫 [SERVICE] Cancelling eSIM profile:', esimTranNo);

    const response = await fetch(`${API_URL}/esim?action=cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ esimTranNo }),
    });

    const data = await response.json();

    console.log('🚫 [SERVICE] Cancel response:', data);

    if (!response.ok) {
      console.error('🚫 [SERVICE] HTTP error:', response.status);
      throw new Error(data.error || 'Failed to cancel eSIM profile');
    }

    if (!data.success) {
      console.error('🚫 [SERVICE] API error:', data.errorMsg);
      throw new Error(data.errorMsg || 'Failed to cancel eSIM profile');
    }

    return data;
  } catch (error) {
    console.error('🚫 [SERVICE] eSIM profile cancel failed:', error);
    throw error;
  }
};

/**
 * Get available top-up plans for an order
 * Queries eSIMAccess API for compatible top-up packages
 *
 * @param {string} orderId - Order ID (UUID)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Available top-up plans and metadata
 */
export const getTopupPlans = async (orderId, userId) => {
  try {
    console.log('💳 [SERVICE] Fetching top-up plans for order:', orderId);

    const response = await fetch(`${API_URL}/orders?action=topup-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, userId }),
    });

    const data = await response.json();

    console.log('💳 [SERVICE] Top-up plans response:', {
      success: data.success,
      plansCount: data.plans?.length || 0,
      topupCount: data.topupCount,
    });

    if (!response.ok) {
      console.error('💳 [SERVICE] HTTP error:', response.status);
      throw new Error(data.error || 'Failed to fetch top-up plans');
    }

    if (!data.success) {
      console.error('💳 [SERVICE] API error:', data.error);
      throw new Error(data.error || 'Failed to fetch top-up plans');
    }

    return data;
  } catch (error) {
    console.error('💳 [SERVICE] Get top-up plans failed:', error);
    throw error;
  }
};

/**
 * Process eSIM top-up
 * Adds data and validity to an existing eSIM
 *
 * @param {Object} topupData - Top-up details
 * @param {string} topupData.orderId - Order ID (UUID)
 * @param {string} topupData.userId - User ID
 * @param {string} topupData.packageCode - Top-up package code
 * @param {number} topupData.priceUzs - Price in UZS
 * @param {number} topupData.priceUsd - Price in USD
 * @param {string} topupData.dataAmount - Data amount (e.g., '1GB')
 * @param {number} topupData.validityDays - Validity in days
 * @param {string} topupData.packageName - Package name
 * @returns {Promise<Object>} Top-up result
 */
export const processTopup = async (topupData) => {
  try {
    console.log('💳 [SERVICE] Processing top-up:', topupData);

    const response = await fetch(`${API_URL}/orders?action=topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topupData),
    });

    const data = await response.json();

    console.log('💳 [SERVICE] Top-up response:', {
      success: data.success,
      transactionId: data.data?.transactionId,
    });

    if (!response.ok) {
      console.error('💳 [SERVICE] HTTP error:', response.status);
      throw new Error(data.error || 'Failed to process top-up');
    }

    if (!data.success) {
      console.error('💳 [SERVICE] API error:', data.error);
      throw new Error(data.error || 'Failed to process top-up');
    }

    return data;
  } catch (error) {
    console.error('💳 [SERVICE] Top-up processing failed:', error);
    throw error;
  }
};

/**
 * Check if order supports top-up
 * Based on order status and eSIM state
 *
 * @param {Object} order - Order object
 * @returns {boolean} Whether order can be topped up
 */
export const canTopup = (order) => {
  if (!order) return false;

  // Must have ICCID (eSIM must be allocated)
  if (!order.iccid && !order.esim_tran_no) {
    console.log('💳 [canTopup] No ICCID or esimTranNo -> false');
    return false;
  }

  // Check eSIM status - only allow top-up for active states
  const { esim_status, smdp_status } = order;

  // Don't allow top-up for deleted or cancelled eSIMs
  if (smdp_status === 'DELETED' || esim_status === 'CANCEL') {
    console.log('💳 [canTopup] DELETED or CANCEL -> false');
    return false;
  }

  // Allow top-up for: New (GOT_RESOURCE), In Use, Depleted
  const allowedStatuses = ['GOT_RESOURCE', 'IN_USE', 'USED_UP'];
  if (!allowedStatuses.includes(esim_status)) {
    console.log('💳 [canTopup] Status not allowed -> false');
    return false;
  }

  // Don't allow if already expired
  if (esim_status === 'USED_EXPIRED') {
    console.log('💳 [canTopup] EXPIRED -> false');
    return false;
  }

  console.log('💳 [canTopup] All checks passed -> true');
  return true;
};