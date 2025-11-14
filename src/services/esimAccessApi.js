// src/services/esimAccessApi.js

import { selectBestPackage } from '../config/pricing.js';
import { getCountryName, DEFAULT_LANGUAGE } from '../src/config/i18n.js';
import { STATIC_PACKAGE_CODES } from '../src/config/staticPackages.js';

// Smart API URL detection
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  return process.env.REACT_APP_PROXY_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// ============================================
// DUAL CACHING: Memory + localStorage
// ============================================
const memoryCache = new Map();
const MEMORY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const LOCALSTORAGE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// localStorage cache (survives page reload)
const getLocalStorageCache = (key) => {
  try {
    const cached = localStorage.getItem(`esim_cache_${key}`);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    
    if (Date.now() - timestamp < LOCALSTORAGE_CACHE_DURATION) {
      console.log(`✅ Using localStorage cache for ${key}`);
      return data;
    }
    
    // Expired, clean up
    localStorage.removeItem(`esim_cache_${key}`);
    return null;
  } catch (e) {
    return null;
  }
};

const setLocalStorageCache = (key, data) => {
  try {
    localStorage.setItem(`esim_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('localStorage full, skipping cache');
  }
};

// Memory cache (fast but temporary)
const getMemoryCache = (key) => {
  const cached = memoryCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_DURATION) {
    console.log(`✅ Using memory cache for ${key}`);
    return cached.data;
  }
  
  return null;
};

const setMemoryCache = (key, data) => {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Combined cache lookup
const getCachedData = (key) => {
  return getMemoryCache(key) || getLocalStorageCache(key);
};

const setCachedData = (key, data) => {
  setMemoryCache(key, data);
  setLocalStorageCache(key, data);
};

// ============================================
// FETCH: Base function with caching
// ============================================
export const fetchPackagesByCountry = async (locationCode, specificPackageCode = null) => {
  const cacheKey = specificPackageCode 
    ? `${locationCode}_${specificPackageCode}`
    : `${locationCode}_all`;
  
  // Check cache first
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  console.log(`🌍 Fetching packages for ${locationCode}${specificPackageCode ? ` (specific: ${specificPackageCode})` : ''}`);

  try {
    const response = await fetch(`${API_URL}/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationCode: locationCode,
        type: '',
        slug: '',
        packageCode: specificPackageCode || '',
        iccid: '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.obj && data.obj.packageList) {
      const packages = data.obj.packageList;
      console.log(`✅ Received ${packages.length} package(s) for ${locationCode}`);
      
      // Cache the data (both memory + localStorage)
      setCachedData(cacheKey, packages);
      
      return packages;
    } else {
      throw new Error(data.errorMsg || 'Invalid API response');
    }
  } catch (error) {
    console.error(`❌ Error fetching ${locationCode}:`, error.message);
    throw error;
  }
};

// ============================================
// Transform Package Data
// ============================================
export const transformPackageData = (apiPackage, countryCode, lang = DEFAULT_LANGUAGE) => {
  const priceInUSD = apiPackage.price / 10000;
  const dataInGB = Math.round(apiPackage.volume / 1073741824);
  const speed = apiPackage.name.includes('5G')
    ? '5G'
    : apiPackage.name.includes('4G')
    ? '4G'
    : '5G';

  const countryName = getCountryName(countryCode, lang);

  return {
    id: apiPackage.packageCode,
    packageCode: apiPackage.packageCode,
    country: countryName,
    countryCode: countryCode,
    data: `${dataInGB}GB`,
    dataGB: dataInGB,
    days: apiPackage.duration,
    speed: speed,
    priceUSD: priceInUSD,
    originalPrice: apiPackage.price,
    description: apiPackage.description,
    name: apiPackage.name,
  };
};

// ============================================
// NEW: Smart fetch for main page (uses static codes)
// ============================================
export const fetchBestPackageForCountry = async (countryCode, lang = DEFAULT_LANGUAGE) => {
  try {
    // Check if we have a static packageCode for this country
    const staticPackageCode = STATIC_PACKAGE_CODES[countryCode];
    
    if (staticPackageCode) {
      // Try to fetch the specific package
      try {
        const packages = await fetchPackagesByCountry(countryCode, staticPackageCode);
        
        if (packages && packages.length > 0) {
          console.log(`✅ Got static package for ${countryCode}`);
          return transformPackageData(packages[0], countryCode, lang);
        }
      } catch (error) {
        console.warn(`⚠️ Static package failed for ${countryCode}, falling back...`);
      }
    }
    
    // Fallback: Fetch all and select best
    console.log(`📦 Falling back to full fetch for ${countryCode}`);
    const packages = await fetchPackagesByCountry(countryCode);
    
    if (!packages || packages.length === 0) {
      return null;
    }
    
    const transformed = packages.map(pkg => transformPackageData(pkg, countryCode, lang));
    return selectBestPackage(transformed);
    
  } catch (error) {
    console.error(`❌ Error fetching best package for ${countryCode}:`, error);
    return null;
  }
};

// ============================================
// Fetch ALL packages for Country Page (unchanged)
// ============================================
export const fetchAllPackagesForCountry = async (
  countryCode,
  lang = DEFAULT_LANGUAGE
) => {
  try {
    const packages = await fetchPackagesByCountry(countryCode);

    if (!packages || packages.length === 0) {
      return [];
    }

    const output = packages.map((pkg) =>
      transformPackageData(pkg, countryCode, lang)
    );

    return output;
  } catch (error) {
    console.error('💥 ERROR in fetchAllPackagesForCountry:', error);
    throw error;
  }
};

// ============================================
// NEW: Optimized fetch for main page (parallel + cached)
// ============================================
export const fetchPackagesForCountries = async (
  countries,
  lang = DEFAULT_LANGUAGE
) => {
  try {
    console.log(`🚀 Fetching packages for ${countries.length} countries (optimized)`);
    
    // Parallel fetch with Promise.allSettled (continues even if one fails)
    const results = await Promise.allSettled(
      countries.map(country => fetchBestPackageForCountry(country.code, lang))
    );
    
    // Filter successful results
    const packages = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
    
    console.log(`✅ Successfully loaded ${packages.length}/${countries.length} packages`);
    
    return packages;
  } catch (err) {
    console.error('💥 Error fetching packages for countries:', err);
    return [];
  }
};

// ============================================
// Utility: Clear all caches (for debugging)
// ============================================
export const clearAllCaches = () => {
  memoryCache.clear();
  
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('esim_cache_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('✅ All caches cleared');
  } catch (e) {
    console.warn('Could not clear localStorage');
  }
};