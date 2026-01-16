// src/services/currencyService.js

/**
 * Currency Service - Fetches USD to UZS exchange rate from Central Bank of Uzbekistan
 * Features:
 * - Fetches daily exchange rate from CBU API
 * - Caches rate for 24 hours in localStorage
 * - Adds 1% markup to official rate
 * - Fallback rate: 12800 UZS/USD
 */

// Vercel Serverless Function endpoint (best solution - no CORS issues)
const SERVERLESS_API = '/api/exchange-rate';

// CBU API endpoint (requires date or returns last week's data)
// Format: https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/YYYY-MM-DD/
const CBU_API_BASE = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD';

// CORS Proxy options (fallback if serverless fails)
const CORS_PROXIES = [
  'https://corsproxy.io/?', // CORS proxy #1
  'https://api.codetabs.com/v1/proxy?quest=', // CORS proxy #2
  'https://api.allorigins.win/raw?url=', // CORS proxy #3 (backup)
];

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
 * Get today's date in YYYY-MM-DD format for CBU API
 * @returns {string}
 */
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fetch exchange rate from Vercel Serverless Function
 * This is the best method (no CORS issues)
 * @returns {Promise<number>}
 */
const fetchFromServerless = async () => {
  console.log('[CurrencyService] Fetching from serverless function...');

  const response = await fetch(SERVERLESS_API, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Serverless API returned status ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.rate) {
    throw new Error(data.error || 'Invalid response from serverless API');
  }

  const finalRate = data.rate;
  console.log('[CurrencyService] Rate from serverless:', finalRate);
  console.log('[CurrencyService] Official CBU rate:', data.officialRate);

  // Cache the rate
  cacheRate(finalRate);

  return finalRate;
};

/**
 * Fetch exchange rate from Central Bank of Uzbekistan API
 * Uses CORS proxy to bypass browser CORS restrictions
 * @returns {Promise<number>}
 */
const fetchExchangeRateFromCBU = async () => {
  const todayDate = getTodayDate();
  const cbuUrl = `${CBU_API_BASE}/${todayDate}/`;

  console.log('[CurrencyService] Fetching exchange rate from CBU API...');
  console.log('[CurrencyService] CBU URL:', cbuUrl);

  // Try direct fetch first (works in some environments)
  try {
    const directResponse = await fetch(cbuUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (directResponse.ok) {
      const data = await directResponse.json();
      return processApiResponse(data);
    }
  } catch (error) {
    console.log('[CurrencyService] Direct fetch failed (CORS issue), trying proxy...');
  }

  // Try with CORS proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[i] + encodeURIComponent(cbuUrl);
      console.log(`[CurrencyService] Trying proxy ${i + 1}/${CORS_PROXIES.length}...`);

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Proxy returned status ${response.status}`);
      }

      const data = await response.json();
      return processApiResponse(data);
    } catch (error) {
      console.error(`[CurrencyService] Proxy ${i + 1} failed:`, error.message);
      if (i === CORS_PROXIES.length - 1) {
        throw error; // Last proxy failed, throw error
      }
    }
  }

  throw new Error('All proxies failed');
};

/**
 * Process CBU API response and extract rate
 * @param {Array|Object} data - Response from CBU API
 * @returns {number}
 */
const processApiResponse = (data) => {
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
};

/**
 * Get current USD to UZS exchange rate
 * - Checks cache first
 * - Tries serverless function (best method)
 * - Falls back to CORS proxies if serverless fails
 * - Returns fallback rate if all methods fail
 * @returns {Promise<number>}
 */
export const getExchangeRate = async () => {
  // Check cache first
  const cachedRate = getCachedRate();
  if (cachedRate) {
    return cachedRate;
  }

  // Try serverless function first (best method - no CORS issues)
  try {
    console.log('[CurrencyService] Attempting serverless function...');
    return await fetchFromServerless();
  } catch (serverlessError) {
    console.warn('[CurrencyService] Serverless function failed:', serverlessError.message);
  }

  // Fall back to CORS proxy method
  try {
    console.log('[CurrencyService] Falling back to CORS proxy method...');
    return await fetchExchangeRateFromCBU();
  } catch (proxyError) {
    console.error('[CurrencyService] All fetch methods failed:', proxyError.message);
  }

  // Use fallback rate
  console.log('[CurrencyService] Using fallback rate:', FALLBACK_RATE);
  return FALLBACK_RATE;
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

const currencyService = {
  getExchangeRate,
  convertUSDToUZS,
  formatUZS,
  refreshExchangeRate,
  getCacheInfo,
};

export default currencyService;
