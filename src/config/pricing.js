// src/config/pricing.js

// DEPRECATED: Static rate is no longer used. Exchange rate is now fetched dynamically from CBU API via currencyService.js
// Keeping this for backwards compatibility and fallback purposes only
export const PRICING_CONFIG = {
  USD_TO_UZS_RATE: parseInt(process.env.REACT_APP_USD_TO_UZS_RATE) || 12000, // Fallback rate
  PROFIT_MARGIN: parseInt(process.env.REACT_APP_PROFIT_MARGIN) || 50, // percentage
};

// API configuration
// NOTE: API keys are now ONLY in backend (api/* files), never exposed to frontend
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_ESIMACCESS_API_URL || 'https://api.esimaccess.com/api/v1/open',
  // ACCESS_CODE and SECRET_KEY removed for security - only backend should have these
};

// ============================================
// HANDPICKED PLAN SLUGS - For homepage "Best Plans" section
// These slugs fetch specific packages via the API
// ============================================
export const HANDPICKED_PLAN_SLUGS = {
  TR: 'TR_20_30',   // Turkey - 20GB, 30 days
  AE: 'AE_20_30',   // UAE - 20GB, 30 days
  TH: 'TH_20_30',   // Thailand - 20GB, 30 days
  VN: 'VN_20_30',   // Vietnam - 20GB, 30 days
  FR: 'FR_20_30',   // France - 20GB, 30 days
};

// ============================================
// POPULAR DESTINATIONS - For "Where are you heading?" section
// Updated to match new Figma design - 10 countries
// ============================================
export const POPULAR_DESTINATIONS = [
  { code: 'TR' }, // Turkey
  { code: 'SA' }, // Saudi Arabia
  { code: 'AE' }, // UAE
  { code: 'EG' }, // Egypt
  { code: 'TH' }, // Thailand
  { code: 'VN' }, // Vietnam
  { code: 'CN' }, // China
  { code: 'US' }, // USA
  { code: 'MY' }, // Malaysia
  { code: 'ID' }, // Indonesia
];

/**
 * Calculate final price with margin
 * @deprecated Use useCurrency().convertToUZS() instead for dynamic rates
 * This function now uses the static fallback rate and should only be used as fallback
 * @param {number} usdPrice - Price in USD (from API, already divided by 10000)
 * @returns {number} Final price in UZS with margin applied
 */
export const calculateFinalPrice = (usdPrice) => {
  const uzsPrice = usdPrice * PRICING_CONFIG.USD_TO_UZS_RATE;
  const margin = (uzsPrice * PRICING_CONFIG.PROFIT_MARGIN) / 100;
  return Math.round(uzsPrice + margin);
};

/**
 * Calculate final price with margin using dynamic exchange rate
 * @param {number} usdPrice - Price in USD (from API, already divided by 10000)
 * @param {number} exchangeRate - Current exchange rate from CBU (already includes 1% markup)
 * @returns {number} Final price in UZS with margin applied
 */
export const calculateFinalPriceWithRate = (usdPrice, exchangeRate) => {
  // Exchange rate from CBU already includes 1% markup, so just convert
  const uzsPrice = usdPrice * exchangeRate;
  // Apply profit margin
  const margin = (uzsPrice * PRICING_CONFIG.PROFIT_MARGIN) / 100;
  return Math.round(uzsPrice + margin);
};

/**
 * Calculate USD price with margin applied
 * @param {number} usdPrice - Original price in USD (from API)
 * @returns {number} USD price with margin applied, rounded to 2 decimal places
 */
export const calculateFinalPriceUSD = (usdPrice) => {
  const margin = (usdPrice * PRICING_CONFIG.PROFIT_MARGIN) / 100;
  return Math.round((usdPrice + margin) * 100) / 100; // Round to 2 decimal places
};

/**
 * Format price for display
 * @param {number} price - Price in UZS
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return price.toLocaleString('en-US').replace(/,/g, ' ');
};