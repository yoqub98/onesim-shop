// src/services/esimAccessApi.js

import { selectBestPackage } from '../config/pricing.js';
import { getCountryName, DEFAULT_LANGUAGE } from '../config/i18n.js';

// Smart API URL detection
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  return process.env.REACT_APP_PROXY_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// ============================================
// IN-MEMORY CACHE
// ============================================
const packageCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (countryCode) => `packages_${countryCode}`;

const getCachedPackages = (countryCode) => {
  const key = getCacheKey(countryCode);
  const cached = packageCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Using cached data for ${countryCode}`);
    return cached.data;
  }
  
  return null;
};

const setCachedPackages = (countryCode, data) => {
  const key = getCacheKey(countryCode);
  packageCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// ============================================
// FETCH: Base function with caching
// ============================================
export const fetchPackagesByCountry = async (locationCode) => {
  // Check cache first
  const cached = getCachedPackages(locationCode);
  if (cached) return cached;

  console.log(`🌍 Fetching packages for ${locationCode}`);

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
        packageCode: '',
        iccid: '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.obj && data.obj.packageList) {
      console.log(`✅ Received ${data.obj.packageList.length} packages for ${locationCode}`);
      
      // Cache the raw data
      setCachedPackages(locationCode, data.obj.packageList);
      
      return data.obj.packageList;
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
// Fetch ALL packages for Country Page with caching
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
// Fetch best packages for home page
// ============================================
export const fetchPackagesForCountries = async (
  countries,
  lang = DEFAULT_LANGUAGE
) => {
  try {
    const allPackages = [];

    for (const country of countries) {
      try {
        const packages = await fetchPackagesByCountry(country.code);

        if (!packages || packages.length === 0) {
          continue;
        }

        const transformed = packages.map((p) =>
          transformPackageData(p, country.code, lang)
        );

        const best = selectBestPackage(transformed);

        if (best) {
          allPackages.push(best);
        }
      } catch (error) {
        console.error(`Error fetching ${country.code}:`, error);
        continue;
      }
    }

    return allPackages;
  } catch (err) {
    console.error('💥 Error fetching packages for countries:', err);
    return [];
  }
};