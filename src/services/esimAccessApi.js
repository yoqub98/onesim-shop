// src/services/esimAccessApi.js

import { getCountryName, DEFAULT_LANGUAGE } from '../config/i18n.js';

// Smart API URL detection
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  return process.env.REACT_APP_PROXY_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('🔗 [INIT] API URL:', API_URL);

// ============================================
// IN-MEMORY CACHE
// ============================================
const packageCache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const getCacheKey = (key) => `package_${key}`;

const getCachedPackage = (key) => {
  const cacheKey = getCacheKey(key);
  const cached = packageCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`✅ Using cached data for ${key}`);
    return cached.data;
  }
  
  return null;
};

const setCachedPackage = (key, data) => {
  const cacheKey = getCacheKey(key);
  packageCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

// ============================================
// FETCH: Package by slug (for handpicked plans)
// ============================================
export const fetchPackageBySlug = async (slug, countryCode) => {
  // Check cache first
  const cached = getCachedPackage(slug);
  if (cached) return cached;

  console.log(`🎯 Fetching package by slug: ${slug}`);

  try {
    const response = await fetch(`${API_URL}/packages?slug=${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.obj && data.obj.packageList && data.obj.packageList.length > 0) {
      console.log(`✅ Found package with slug ${slug}`);
      const pkg = data.obj.packageList[0];
      
      // Cache it
      setCachedPackage(slug, pkg);
      
      return pkg;
    } else {
      console.warn(`⚠️ Package with slug ${slug} not found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error fetching package ${slug}:`, error.message);
    return null;
  }
};

// ============================================
// FETCH: Multiple packages by slugs (for handpicked plans)
// ============================================
export const fetchHandpickedPackages = async (planSlugsMap, lang = DEFAULT_LANGUAGE) => {
  console.log(`🎯 Fetching handpicked packages...`);
  
  const results = [];

  for (const [countryCode, slug] of Object.entries(planSlugsMap)) {
    try {
      const pkg = await fetchPackageBySlug(slug, countryCode);
      
      if (pkg) {
        const transformed = transformPackageData(pkg, countryCode, lang);
        results.push(transformed);
      }
    } catch (error) {
      console.error(`Error fetching ${countryCode} (${slug}):`, error);
      continue;
    }
  }

  console.log(`✅ Fetched ${results.length} handpicked packages`);
  return results;
};

// ============================================
// FETCH: All packages for a country (for Country Page)
// ============================================
export const fetchPackagesByCountry = async (locationCode) => {
  // Check cache first
  const cached = getCachedPackage(`country_${locationCode}`);
  if (cached) return cached;

  console.log(`🌍 Fetching all packages for ${locationCode}`);

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
      setCachedPackage(`country_${locationCode}`, data.obj.packageList);
      
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
// Fetch ALL packages for Country Page (lazy loaded)
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