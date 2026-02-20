// src/services/packageService.js
// New service for fetching packages from our own database via API
import { API_BASE } from '../config/api.js';

const API_URL = API_BASE;

/**
 * Fetch packages for a specific country
 * @param {string} countryCode - Country code (e.g., 'TR', 'AE')
 * @returns {Promise<Array>} Array of packages
 */
export const fetchPackagesByCountry = async (countryCode) => {
  console.log(`📦 [PKG_SERVICE] Fetching packages for country: ${countryCode}`);

  try {
    const response = await fetch(`${API_URL}/packages-v2?type=country&country=${countryCode}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch packages');
    }

    console.log(`✅ [PKG_SERVICE] Loaded ${result.data.length} packages for ${countryCode}`);
    return result.data;

  } catch (error) {
    console.error(`❌ [PKG_SERVICE] Error fetching packages for ${countryCode}:`, error);
    throw error;
  }
};

/**
 * Fetch packages for a specific region
 * @param {string} regionCode - Region code (e.g., 'EU', 'ASIA')
 * @returns {Promise<Array>} Array of regional packages
 */
export const fetchPackagesByRegion = async (regionCode) => {
  console.log(`📦 [PKG_SERVICE] Fetching regional packages for: ${regionCode}`);

  try {
    const response = await fetch(`${API_URL}/packages-v2?type=regional&region=${regionCode}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch regional packages');
    }

    console.log(`✅ [PKG_SERVICE] Loaded ${result.data.length} regional packages`);
    return result.data;

  } catch (error) {
    console.error(`❌ [PKG_SERVICE] Error fetching regional packages:`, error);
    throw error;
  }
};

/**
 * Fetch all regional packages grouped by region
 * @returns {Promise<Object>} Object with region codes as keys
 */
export const fetchAllRegionalPackages = async () => {
  console.log('📦 [PKG_SERVICE] Fetching all regional packages');

  try {
    const response = await fetch(`${API_URL}/packages-v2?type=regional-all`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch regional packages');
    }

    console.log(`✅ [PKG_SERVICE] Loaded regional packages for ${Object.keys(result.data).length} regions`);
    return result.data;

  } catch (error) {
    console.error('❌ [PKG_SERVICE] Error fetching regional packages:', error);
    throw error;
  }
};

/**
 * Fetch global packages
 * @returns {Promise<Array>} Array of global packages
 */
export const fetchGlobalPackages = async () => {
  console.log('📦 [PKG_SERVICE] Fetching global packages');

  try {
    const response = await fetch(`${API_URL}/packages-v2?type=global`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch global packages');
    }

    console.log(`✅ [PKG_SERVICE] Loaded ${result.data.length} global packages`);
    return result.data;

  } catch (error) {
    console.error('❌ [PKG_SERVICE] Error fetching global packages:', error);
    throw error;
  }
};

/**
 * Fetch a single package by slug
 * @param {string} slug - Package slug
 * @returns {Promise<Object>} Package object
 */
export const fetchPackageBySlug = async (slug) => {
  console.log(`📦 [PKG_SERVICE] Fetching package by slug: ${slug}`);

  try {
    const response = await fetch(`${API_URL}/packages-v2?type=slug&slug=${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Package not found');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch package');
    }

    console.log(`✅ [PKG_SERVICE] Loaded package: ${result.data.packageCode}`);
    return result.data;

  } catch (error) {
    console.error(`❌ [PKG_SERVICE] Error fetching package ${slug}:`, error);
    throw error;
  }
};
