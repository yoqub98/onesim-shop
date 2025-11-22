// src/config/pricing.js
import { getCountryName, DEFAULT_LANGUAGE } from './i18n.js';

// Pricing configuration with environment variable support
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
// ============================================
export const POPULAR_DESTINATIONS = [
  { code: 'TR' }, // Turkey
  { code: 'AE' }, // UAE
  { code: 'TH' }, // Thailand
  { code: 'IT' }, // Italy
  { code: 'FR' }, // France
  { code: 'GE' }, // Georgia
  { code: 'VN' }, // Vietnam
  { code: 'ES' }, // Spain
  { code: 'KR' }, // South Korea
  { code: 'UZ' }, // Uzbekistan
  { code: 'DE' }, // Germany
];

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