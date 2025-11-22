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
// FIXED: Put slug in request BODY, not URL!
// ============================================
export const fetchPackageBySlug = async (slug, countryCode) => {
  // Check cache first
  const cached = getCachedPackage(slug);
  if (cached) return cached;

  console.log(`🎯 Fetching package by slug: ${slug} for country: ${countryCode}`);

  try {
    // ✅ FIXED: slug goes in the BODY, not the URL
    const response = await fetch(`${API_URL}/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationCode: '',
        type: '',
        slug: slug,  // ✅ Slug in body!
        packageCode: '',
        iccid: '',
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    console.log(`📦 RAW API RESPONSE for slug ${slug}:`, {
      success: data.success,
      packageCount: data.obj?.packageList?.length || 0,
    });

    if (data.success && data.obj && data.obj.packageList && data.obj.packageList.length > 0) {
      const pkg = data.obj.packageList[0];
      
      // DETAILED LOGGING OF THE PACKAGE
      console.log(`📋 PACKAGE DETAILS for ${slug}:`, {
        packageCode: pkg.packageCode,
        slug: pkg.slug,
        name: pkg.name,
        price: pkg.price,
        priceInUSD: pkg.price / 10000,
        volume: pkg.volume,
        volumeInGB: Math.round(pkg.volume / 1073741824),
        duration: pkg.duration,
        durationUnit: pkg.durationUnit,
        locationCode: pkg.locationCode,
        speed: pkg.speed,
      });
      
      // Cache it
      setCachedPackage(slug, pkg);
      
      console.log(`✅ Found package with slug ${slug}`);
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
  console.log(`📝 Slugs to fetch:`, planSlugsMap);
  
  const results = [];

  for (const [countryCode, slug] of Object.entries(planSlugsMap)) {
    try {
      const pkg = await fetchPackageBySlug(slug, countryCode);
      
      if (pkg) {
        const transformed = transformPackageData(pkg, countryCode, lang);
        
        console.log(`🔄 TRANSFORMED PACKAGE for ${countryCode}:`, {
          country: transformed.country,
          data: transformed.data,
          dataGB: transformed.dataGB,
          days: transformed.days,
          priceUSD: transformed.priceUSD,
          speed: transformed.speed,
        });
        
        results.push(transformed);
      }
    } catch (error) {
      console.error(`Error fetching ${countryCode} (${slug}):`, error);
      continue;
    }
  }

  console.log(`✅ Fetched ${results.length} handpicked packages`);
  console.log(`📊 FINAL RESULTS:`, results);
  
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
  const speed = apiPackage.speed || (apiPackage.name.includes('5G')
    ? '5G'
    : apiPackage.name.includes('4G')
    ? '4G'
    : '4G/5G');

  const countryName = getCountryName(countryCode, lang);

  // Extract operators for the specific country from locationNetworkList
  let operators = [];
  if (apiPackage.locationNetworkList && Array.isArray(apiPackage.locationNetworkList)) {
    // Find the location entry that matches our countryCode
    const locationEntry = apiPackage.locationNetworkList.find(
      loc => loc.locationCode === countryCode
    );

    if (locationEntry && locationEntry.operatorList) {
      operators = locationEntry.operatorList.map(op => ({
        operatorName: op.operatorName,
        networkType: op.networkType
      }));
    }
  }

  // Create unique ID using packageCode + slug to avoid duplicates
  const uniqueId = `${apiPackage.packageCode}_${apiPackage.slug || ''}`;

  return {
    id: uniqueId,
    packageCode: apiPackage.packageCode,
    slug: apiPackage.slug,
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
    operatorList: operators,
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

    // Transform all packages
    const transformed = packages.map((pkg) =>
      transformPackageData(pkg, countryCode, lang)
    );

    // Deduplicate by packageCode (keep the first occurrence)
    const seen = new Set();
    const deduplicated = transformed.filter(pkg => {
      if (seen.has(pkg.packageCode)) {
        console.log(`🗑️ Removing duplicate: ${pkg.packageCode} (${pkg.data}, ${pkg.days} days)`);
        return false;
      }
      seen.add(pkg.packageCode);
      return true;
    });

    console.log(`📊 Total packages: ${packages.length}, After deduplication: ${deduplicated.length}`);

    return deduplicated;
  } catch (error) {
    console.error('💥 ERROR in fetchAllPackagesForCountry:', error);
    throw error;
  }
};