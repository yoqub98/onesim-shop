// src/services/orderService.js
// Service for handling eSIM orders

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
 * Get order status display text (Russian)
 * @param {string} status - Order status
 * @returns {string} Translated status text
 */
export const getOrderStatusText = (status) => {
  const statusMap = {
    'PENDING': 'В обработке',
    'PROCESSING': 'Обрабатывается',
    'ALLOCATED': 'Готов к активации',
    'FAILED': 'Ошибка',
    'CANCELLED': 'Отменен',
  };
  return statusMap[status] || status;
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
 * Get eSIM status display text (Russian)
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @returns {string} Translated eSIM status text
 */
export const getEsimStatusText = (esimStatus) => {
  if (!esimStatus) return null;

  const statusMap = {
    'GOT_RESOURCE': 'Готов к активации',
    'NOT_ACTIVATED': 'Не активирован',
    'ACTIVATED': 'Активирован',
    'USED': 'Используется',
    'DELETED': 'Удален',
    'CANCELLED': 'Отменен',
  };
  return statusMap[esimStatus] || esimStatus;
};

/**
 * Get eSIM status color for Chakra UI
 * @param {string} esimStatus - eSIM status from eSIMAccess API
 * @returns {string} Chakra color scheme
 */
export const getEsimStatusColor = (esimStatus) => {
  if (!esimStatus) return 'gray';

  const colorMap = {
    'GOT_RESOURCE': 'blue',
    'NOT_ACTIVATED': 'yellow',
    'ACTIVATED': 'green',
    'USED': 'purple',
    'DELETED': 'red',
    'CANCELLED': 'gray',
  };
  return colorMap[esimStatus] || 'gray';
};
