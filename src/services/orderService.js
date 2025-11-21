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
