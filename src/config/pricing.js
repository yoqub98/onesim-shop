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

// Country mappings for our landing page - UPDATED with new countries
// Display names will be fetched from i18n based on current language
export const COUNTRY_MAPPINGS = {
  ASIA: [
    { code: 'TH' },
    { code: 'AE' },
    { code: 'VN' },
    { code: 'MY' },
    { code: 'CN' },
  ],
  EUROPE: [
    { code: 'TR' },
    { code: 'GE' },
    { code: 'IT' },
    { code: 'FR' },
    { code: 'AZ' },
  ],
};

// Popular destinations for the main page
export const POPULAR_DESTINATIONS = [
  { code: 'TR' }, // Turkey
  { code: 'AE' }, // UAE
  { code: 'TH' }, // Thailand
  { code: 'IT' }, // Italy
  { code: 'FR' }, // France
  { code: 'GE' }, // Georgia
  { code: 'VN' }, // Vietnam
  { code: 'ES' }, // Spain
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

/**
 * Filter packages to get the best one per country
 * Strategy: 
 * 1. Prefer 20GB, 30-day plans
 * 2. If no 20GB, get the next higher GB plan
 * 3. Prefer 30-day duration, otherwise get closest available
 * @param {Array} packages - Array of package objects
 * @returns {Object|null} Best package or null
 */
export const selectBestPackage = (packages) => {
  if (!packages || packages.length === 0) return null;

  // Target: 20GB, 30 days
  const TARGET_GB = 20;
  const TARGET_DAYS = 30;

  // First, try to find exact match: 20GB, 30 days
  let bestPackage = packages.find(
    pkg => pkg.dataGB === TARGET_GB && pkg.days === TARGET_DAYS
  );

  if (bestPackage) return bestPackage;

  // Second, try to find 20GB with any duration (prefer 30 days, then closest)
  const twentyGBPackages = packages.filter(pkg => pkg.dataGB === TARGET_GB);
  if (twentyGBPackages.length > 0) {
    // Sort by how close to 30 days
    twentyGBPackages.sort((a, b) => {
      const diffA = Math.abs(a.days - TARGET_DAYS);
      const diffB = Math.abs(b.days - TARGET_DAYS);
      return diffA - diffB;
    });
    return twentyGBPackages[0];
  }

  // Third, find packages with GB >= 20, prefer 30-day duration
  const higherGBPackages = packages.filter(pkg => pkg.dataGB >= TARGET_GB);
  if (higherGBPackages.length > 0) {
    // Sort by GB (ascending) and days (prefer 30)
    higherGBPackages.sort((a, b) => {
      // First priority: closest to 30 days
      const daysDiffA = Math.abs(a.days - TARGET_DAYS);
      const daysDiffB = Math.abs(b.days - TARGET_DAYS);
      
      if (daysDiffA !== daysDiffB) {
        return daysDiffA - daysDiffB;
      }
      
      // Second priority: lowest GB (but still >= 20)
      return a.dataGB - b.dataGB;
    });
    return higherGBPackages[0];
  }

  // Fourth, if no 20GB+ available, get the highest GB with closest to 30 days
  packages.sort((a, b) => {
    // First priority: highest GB
    if (a.dataGB !== b.dataGB) {
      return b.dataGB - a.dataGB;
    }
    
    // Second priority: closest to 30 days
    const daysDiffA = Math.abs(a.days - TARGET_DAYS);
    const daysDiffB = Math.abs(b.days - TARGET_DAYS);
    return daysDiffA - daysDiffB;
  });

  return packages[0];
};