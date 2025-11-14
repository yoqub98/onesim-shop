// src/services/esimAccessApi.js
// Enhanced API service with improved filtering and i18n support

import { selectBestPackage } from '../config/pricing';
import { getCountryName, DEFAULT_LANGUAGE } from '../config/i18n';

// Smart API URL detection
const getApiUrl = () => {
  // Production (Vercel): Use relative path (same domain, no CORS)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // Development: Use environment variable or localhost proxy
  return process.env.REACT_APP_PROXY_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('🔗 API URL:', API_URL);

/**
 * Fetch packages for a specific country from esimAccess API
 * @param {string} locationCode - ISO country code (e.g., 'TR', 'AE')
 * @returns {Promise<Array>} Array of package objects
 */
export const fetchPackagesByCountry = async (locationCode) => {
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
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.obj && data.obj.packageList) {
      return data.obj.packageList;
    } else {
      console.error('API Error:', data.errorMsg);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch packages:', error);
    return [];
  }
};

/**
 * Transform API package data to our display format
 * @param {Object} apiPackage - Package object from API
 * @param {string} countryCode - ISO country code
 * @param {string} lang - Language code (defaults to Russian)
 * @returns {Object} Transformed package object
 */
export const transformPackageData = (apiPackage, countryCode, lang = DEFAULT_LANGUAGE) => {
  // Convert price from API format (divide by 10000 to get USD)
  const priceInUSD = apiPackage.price / 10000;
  
  // Convert data volume from bytes to GB
  const dataInGB = Math.round(apiPackage.volume / 1073741824);
  
  // Determine speed based on package name or default to 5G
  const speed = apiPackage.name.includes('5G') ? '5G' : 
                apiPackage.name.includes('4G') ? '4G' : '5G';

  // Get translated country name
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

/**
 * Fetch and transform packages for multiple countries
 * Returns only ONE package per country based on selection criteria
 * @param {Array} countries - Array of country objects {code}
 * @param {string} lang - Language for translations
 * @returns {Promise<Array>} Array of transformed package objects (one per country)
 */
export const fetchPackagesForCountries = async (countries, lang = DEFAULT_LANGUAGE) => {
  try {
    const allPackages = [];

    for (const country of countries) {
      const packages = await fetchPackagesByCountry(country.code);
      
      if (packages.length > 0) {
        // Transform all packages for this country
        const transformedPackages = packages.map(pkg => 
          transformPackageData(pkg, country.code, lang)
        );
        
        // Select the BEST single package for this country
        const bestPackage = selectBestPackage(transformedPackages);
        
        if (bestPackage) {
          allPackages.push(bestPackage);
        }
      }
    }

    return allPackages;
  } catch (error) {
    console.error('Error fetching packages for countries:', error);
    return [];
  }
};

/**
 * Fetch ALL packages for a specific country (for country detail page)
 * @param {string} countryCode - ISO country code
 * @param {string} lang - Language for translations
 * @returns {Promise<Array>} Array of all packages for the country
 */
export const fetchAllPackagesForCountry = async (countryCode, lang = DEFAULT_LANGUAGE) => {
  try {
    const packages = await fetchPackagesByCountry(countryCode);
    
    if (packages.length > 0) {
      return packages.map(pkg => transformPackageData(pkg, countryCode, lang));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching all packages for country:', error);
    return [];
  }
};