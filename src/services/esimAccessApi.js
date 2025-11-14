// src/services/esimAccessApi.js
// Automatically detects environment and uses correct API URL

import { API_CONFIG } from '../config/pricing';

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

console.log('🔗 API URL:', API_URL); // Debug log

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
 * Fetch all packages (no country filter)
 * @returns {Promise<Array>} Array of all package objects
 */
export const fetchAllPackages = async () => {
  try {
    const response = await fetch(`${API_URL}/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationCode: '',
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
 * @param {string} countryName - Display name for the country
 * @param {string} countryCode - ISO country code
 * @returns {Object} Transformed package object
 */
export const transformPackageData = (apiPackage, countryName, countryCode) => {
  // Convert price from API format (divide by 10000 to get USD)
  const priceInUSD = apiPackage.price / 10000;
  
  // Convert data volume from bytes to GB
  const dataInGB = Math.round(apiPackage.volume / 1073741824);
  
  // Determine speed based on package name or default to 5G
  const speed = apiPackage.name.includes('5G') ? '5G' : 
                apiPackage.name.includes('4G') ? '4G' : '5G';

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
 * Filter packages to get the best ones for display
 * Strategy: Get packages with good data/price ratio
 * @param {Array} packages - Array of package objects
 * @param {number} limit - Maximum number of packages to return
 * @returns {Array} Filtered array of packages
 */
export const filterBestPackages = (packages, limit = 4) => {
  if (!packages || packages.length === 0) return [];

  // Calculate value score (GB per USD)
  const packagesWithScore = packages.map(pkg => ({
    ...pkg,
    valueScore: pkg.dataGB / pkg.priceUSD,
  }));

  // Sort by value score (best value first)
  packagesWithScore.sort((a, b) => b.valueScore - a.valueScore);

  // Return top packages
  return packagesWithScore.slice(0, limit);
};

/**
 * Fetch and transform packages for multiple countries
 * @param {Array} countries - Array of country objects {name, code, displayName}
 * @returns {Promise<Array>} Array of transformed package objects
 */
export const fetchPackagesForCountries = async (countries) => {
  try {
    const allPackages = [];

    for (const country of countries) {
      const packages = await fetchPackagesByCountry(country.code);
      
      if (packages.length > 0) {
        // Transform each package
        const transformedPackages = packages.map(pkg => 
          transformPackageData(pkg, country.displayName, country.code)
        );
        
        // Get best packages for this country (e.g., top 2)
        const bestPackages = filterBestPackages(transformedPackages, 2);
        allPackages.push(...bestPackages);
      }
    }

    return allPackages;
  } catch (error) {
    console.error('Error fetching packages for countries:', error);
    return [];
  }
};