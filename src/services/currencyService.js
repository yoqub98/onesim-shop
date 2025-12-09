// src/services/currencyService.js

/**
 * Currency Service - Fetches USD to UZS exchange rate from Central Bank of Uzbekistan
 * Features:
 * - Fetches daily exchange rate from CBU API
 * - Caches rate for 24 hours in localStorage
 * - Adds 1% markup to official rate
 * - Fallback rate: 12800 UZS/USD
 */

const CBU_API_URL = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD';
const CACHE_KEY = 'cbu_exchange_rate';
const CACHE_TIMESTAMP_KEY = 'cbu_exchange_rate_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const FALLBACK_RATE = 12800; // Fallback rate if API fails
const MARKUP_PERCENTAGE = 1.01; // 1% markup

/**
 * Check if cached rate is still valid (less than 24 hours old)
 * @returns {boolean}
 */
const isCacheValid = () => {
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const now = Date.now();
  const cacheAge = now - parseInt(timestamp, 10);
  return cacheAge < CACHE_DURATION;
};

/**
 * Get cached exchange rate from localStorage
 * @returns {number|null}
 */
const getCachedRate = () => {
  if (!isCacheValid()) {
    console.log('[CurrencyService] Cache expired or not found');
    return null;
  }

  const cachedRate = localStorage.getItem(CACHE_KEY);
  if (!cachedRate) return null;

  console.log('[CurrencyService] Using cached rate:', cachedRate);
  return parseFloat(cachedRate);
};

/**
 * Save exchange rate to localStorage with timestamp
 * @param {number} rate
 */
const cacheRate = (rate) => {
  localStorage.setItem(CACHE_KEY, rate.toString());
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  console.log('[CurrencyService] Rate cached:', rate);
};

/**
 * Fetch exchange rate from Central Bank of Uzbekistan API
 * @returns {Promise<number>}
 */
const fetchExchangeRateFromCBU = async () => {
  try {
    console.log('[CurrencyService] Fetching exchange rate from CBU API...');

    const response = await fetch(CBU_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CBU API returned status ${response.status}`);
    }

    const data = await response.json();

    // CBU API returns an array with one object for USD
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid response format from CBU API');
    }

    const usdData = data[0];
    const officialRate = parseFloat(usdData.Rate);

    if (isNaN(officialRate) || officialRate <= 0) {
      throw new Error('Invalid exchange rate received from CBU API');
    }

    console.log('[CurrencyService] Official CBU rate:', officialRate);

    // Apply 1% markup
    const finalRate = Math.round(officialRate * MARKUP_PERCENTAGE);
    console.log('[CurrencyService] Final rate with 1% markup:', finalRate);

    // Cache the rate
    cacheRate(finalRate);

    return finalRate;
  } catch (error) {
    console.error('[CurrencyService] Error fetching from CBU API:', error.message);
    console.log('[CurrencyService] Using fallback rate:', FALLBACK_RATE);
    return FALLBACK_RATE;
  }
};

/**
 * Get current USD to UZS exchange rate
 * - Checks cache first
 * - If cache is invalid or missing, fetches from CBU API
 * - Returns fallback rate if API fails
 * @returns {Promise<number>}
 */
export const getExchangeRate = async () => {
  // Check cache first
  const cachedRate = getCachedRate();
  if (cachedRate) {
    return cachedRate;
  }

  // Fetch from API
  return await fetchExchangeRateFromCBU();
};

/**
 * Convert USD to UZS using current exchange rate
 * @param {number} usdAmount - Amount in USD
 * @returns {Promise<number>} - Amount in UZS
 */
export const convertUSDToUZS = async (usdAmount) => {
  if (isNaN(usdAmount) || usdAmount < 0) {
    console.error('[CurrencyService] Invalid USD amount:', usdAmount);
    return 0;
  }

  const rate = await getExchangeRate();
  const uzsAmount = Math.round(usdAmount * rate);

  console.log(`[CurrencyService] Converted $${usdAmount} to ${uzsAmount} UZS (rate: ${rate})`);

  return uzsAmount;
};

/**
 * Format UZS amount for display
 * @param {number} amount - Amount in UZS
 * @returns {string} - Formatted string (e.g., "125 000")
 */
export const formatUZS = (amount) => {
  if (isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('en-US').replace(/,/g, ' ');
};

/**
 * Force refresh exchange rate from CBU API (bypasses cache)
 * Useful for manual refresh or testing
 * @returns {Promise<number>}
 */
export const refreshExchangeRate = async () => {
  console.log('[CurrencyService] Force refreshing exchange rate...');
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  return await fetchExchangeRateFromCBU();
};

/**
 * Get cache info for debugging
 * @returns {object}
 */
export const getCacheInfo = () => {
  const rate = localStorage.getItem(CACHE_KEY);
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const isValid = isCacheValid();

  return {
    rate: rate ? parseFloat(rate) : null,
    timestamp: timestamp ? new Date(parseInt(timestamp, 10)).toISOString() : null,
    isValid,
    expiresIn: timestamp
      ? Math.max(0, CACHE_DURATION - (Date.now() - parseInt(timestamp, 10)))
      : 0,
  };
};

export default {
  getExchangeRate,
  convertUSDToUZS,
  formatUZS,
  refreshExchangeRate,
  getCacheInfo,
};
