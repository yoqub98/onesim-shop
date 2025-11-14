// src/config/pricing.js

// Pricing configuration
export const PRICING_CONFIG = {
  USD_TO_UZS_RATE: parseInt(process.env.REACT_APP_USD_TO_UZS_RATE) || 12000,
  PROFIT_MARGIN: parseInt(process.env.REACT_APP_PROFIT_MARGIN) || 50, // percentage
};

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_ESIMACCESS_API_URL || 'https://api.esimaccess.com/api/v1/open',
  ACCESS_CODE: process.env.REACT_APP_ESIMACCESS_API_KEY,
  SECRET_KEY: process.env.REACT_APP_ESIMACCESS_SECRET_KEY,
};

// Country mappings for our landing page
export const COUNTRY_MAPPINGS = {
  ASIA: [
    { name: 'ОАЭ', code: 'AE', displayName: 'ОАЭ' },
    // Add more Asian countries here later
  ],
  EUROPE: [
    { name: 'Турция', code: 'TR', displayName: 'Турция' },
    // Add more European countries here later
  ],
};

/**
 * Calculate final price with margin
 * @param {number} usdPrice - Price in USD (from API, already divided by 10000)
 * @returns {number} Final price in UZS with margin applied
 */
export const calculateFinalPrice = (usdPrice) => {
  const uzsPrice = usdPrice * PRICING_CONFIG.USD_TO_UZS_RATE;
  const margin = (uzsPrice * PRICING_CONFIG.PROFIT_MARGIN) / 100;
  return Math.round(uzsPrice + margin);
};

/**
 * Format price for display
 * @param {number} price - Price in UZS
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return price.toLocaleString('en-US').replace(/,/g, ' ');
};