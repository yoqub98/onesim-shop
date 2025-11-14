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

console.log('🔗 [INIT] API URL:', API_URL);


// ============================================
// FETCH: Base function with EXTREME DEBUG LOGGING
// ============================================
export const fetchPackagesByCountry = async (locationCode) => {
  console.log(`\n============================`);
  console.log(`🌍 Fetching packages for country: ${locationCode}`);
  console.log(`➡️ POST ${API_URL}/packages`);
  console.log(`📦 Request Body:`, {
    locationCode,
    type: '',
    slug: '',
    packageCode: '',
    iccid: '',
  });
  console.log(`============================\n`);

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

    console.log(`📡 Response status: ${response.status}`);

    // Log response headers
    const headers = {};
    response.headers.forEach((v, k) => (headers[k] = v));
    console.log('📑 Response headers:', headers);

    if (!response.ok) {
      console.error('❌ API request failed with status:', response.status);
      return [];
    }

    const data = await response.json();

    console.log('📨 Raw API response JSON:', data);

    if (data.success && data.obj && data.obj.packageList) {
      console.log(
        `✅ Success: received ${data.obj.packageList.length} packages for ${locationCode}`
      );
      return data.obj.packageList;
    } else {
      console.error('⚠️ API responded with success=false OR missing packageList');
      console.error('🔍 API error message:', data.errorMsg);
      return [];
    }
  } catch (error) {
    console.error('💥 Fetch ERROR:', error);
    return [];
  }
};


// ============================================
// Fetch ALL packages for Country Page (DEBUG)
// ============================================
export const fetchAllPackagesForCountry = async (
  countryCode,
  lang = DEFAULT_LANGUAGE
) => {
  console.log(`\n\n==============================`);
  console.log(`📘 fetchAllPackagesForCountry() START`);
  console.log(`Country: ${countryCode}`);
  console.log(`Language: ${lang}`);
  console.log(`==============================\n`);

  try {
    const packages = await fetchPackagesByCountry(countryCode);

    console.log(
      `📦 Raw package list from fetchPackagesByCountry:`,
      packages
    );

    if (!packages || packages.length === 0) {
      console.warn(`⚠️ No packages found for ${countryCode}`);
      return [];
    }

    const output = packages.map((pkg) =>
      transformPackageData(pkg, countryCode, lang)
    );

    console.log(
      `🎯 Transformed packages (${output.length} items):`,
      output
    );

    return output;
  } catch (error) {
    console.error('💥 ERROR in fetchAllPackagesForCountry:', error);
    return [];
  }
};


// ============================================
// Transform Package Data (optional log)
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


export const fetchPackagesForCountries = async (
  countries,
  lang = DEFAULT_LANGUAGE
) => {
  try {
    const allPackages = [];

    for (const country of countries) {
      console.log(`🌎 Fetching best package for: ${country.code}`);

      const packages = await fetchPackagesByCountry(country.code);

      if (!packages || packages.length === 0) {
        console.log(`⚠️ No packages for ${country.code}`);
        continue;
      }

      const transformed = packages.map((p) =>
        transformPackageData(p, country.code, lang)
      );

      const best = selectBestPackage(transformed);

      if (best) {
        console.log(`🎯 Best package for ${country.code}:`, best);
        allPackages.push(best);
      }
    }

    console.log(`🏁 fetchPackagesForCountries DONE`);
    return allPackages;
  } catch (err) {
    console.error('💥 Error fetching packages for countries:', err);
    return [];
  }
};
