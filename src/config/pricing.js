// src/config/pricing.js
// Pricing is computed server-side. Frontend only formats and displays values.

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
 * Legacy helper kept for compatibility with existing components.
 * Frontend no longer applies margin; value is treated as already-final USD.
 * @param {number} usdPrice - Price in USD (from API, already divided by 10000)
 * @returns {number} Rounded numeric value
 */
export const calculateFinalPrice = (usdPrice) => {
  return Math.round(Number(usdPrice) || 0);
};

/**
 * Legacy helper kept for compatibility with existing components.
 * Frontend no longer applies margin; value is treated as already-final USD.
 * @param {number} usdPrice - Price in USD
 * @returns {number} Rounded numeric value
 */
export const calculateFinalPriceWithRate = (usdPrice) => {
  return Math.round(Number(usdPrice) || 0);
};

/**
 * Return already-final USD price without applying frontend margin.
 * @param {number} usdPrice - Final price in USD from backend
 * @returns {number} Rounded to 2 decimals
 */
export const calculateFinalPriceUSD = (usdPrice) => {
  return Math.round((Number(usdPrice) || 0) * 100) / 100;
};

/**
 * Format price for display
 * @param {number} price - Price in UZS
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return price.toLocaleString('en-US').replace(/,/g, ' ');
};
