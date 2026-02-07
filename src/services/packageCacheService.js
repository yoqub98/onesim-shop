/**
 * Package Cache Service
 * Handles caching of regional and global packages in Supabase
 * Cache Duration: 1 week (prices remain stable)
 */

import { supabase } from '../lib/supabaseClient.js';

// Cache duration: 7 days
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Region Definitions
 * Maps region codes to their names and patterns
 */
export const REGION_DEFINITIONS = {
  'EU': {
    name: 'Europe',
    nameRu: 'Европа',
    nameUz: 'Yevropa',
    patterns: ['EU-', 'EU_', 'EUROPE-', 'EUROPE_'],
    icon: '🇪🇺'
  },
  'ASIA': {
    name: 'Asia',
    nameRu: 'Азия',
    nameUz: 'Osiyo',
    patterns: ['ASIA-', 'ASIA_', 'AS-', 'AS_'],
    icon: '🌏'
  },
  'ME': {
    name: 'Middle East',
    nameRu: 'Ближний Восток',
    nameUz: 'Yaqin Sharq',
    patterns: ['ME-', 'ME_', 'MIDDLEEAST-', 'MIDDLEEAST_'],
    icon: '🕌'
  },
  'AM': {
    name: 'Americas',
    nameRu: 'Америка',
    nameUz: 'Amerika',
    patterns: ['AM-', 'AM_', 'AMERICAS-', 'AMERICAS_', 'LATAM-', 'LATAM_', 'SA-', 'SA_', 'NA-', 'NA_'],
    icon: '🌎'
  },
  'AF': {
    name: 'Africa',
    nameRu: 'Африка',
    nameUz: 'Afrika',
    patterns: ['AF-', 'AF_', 'AFRICA-', 'AFRICA_'],
    icon: '🌍'
  },
  'OC': {
    name: 'Oceania',
    nameRu: 'Океания',
    nameUz: 'Okeaniya',
    patterns: ['OC-', 'OC_', 'OCEANIA-', 'OCEANIA_', 'PACIFIC-', 'PACIFIC_'],
    icon: '🏝️'
  },
  'GLOBAL': {
    name: 'Global',
    nameRu: 'Глобальный',
    nameUz: 'Global',
    patterns: ['GL', 'GLOBAL-', 'GLOBAL_'],
    icon: '🌐'
  },
  'OTHER': {
    name: 'Other',
    nameRu: 'Другие',
    nameUz: 'Boshqalar',
    patterns: [],
    icon: '🌍'
  }
};

/**
 * Detect region from locationCode
 * @param {string} locationCode - Package location code
 * @returns {string} Region code or 'OTHER'
 */
export const detectRegion = (locationCode) => {
  if (!locationCode) return 'OTHER';

  // Strip leading '!' prefix used by eSIM Access API for regional/global codes
  const normalizedCode = locationCode.startsWith('!') ? locationCode.substring(1) : locationCode;

  for (const [regionCode, regionDef] of Object.entries(REGION_DEFINITIONS)) {
    for (const pattern of regionDef.patterns) {
      const normalizedPattern = pattern.startsWith('!') ? pattern.substring(1) : pattern;
      if (normalizedCode.startsWith(normalizedPattern) || locationCode.startsWith(pattern)) {
        return regionCode;
      }
    }
  }

  return 'OTHER';
};

/**
 * Get region name by language
 * @param {string} regionCode - Region code
 * @param {string} lang - Language code (en, ru, uz)
 * @returns {string} Localized region name
 */
export const getRegionName = (regionCode, lang = 'en') => {
  const region = REGION_DEFINITIONS[regionCode];
  if (!region) return regionCode;

  switch (lang) {
    case 'ru':
      return region.nameRu || region.name;
    case 'uz':
      return region.nameUz || region.name;
    default:
      return region.name;
  }
};

// Slug prefix → localized region names (covers prefixes not in REGION_DEFINITIONS)
const SLUG_PREFIX_MAP = {
  'EU': { ru: 'Европа', uz: 'Yevropa' },
  'EUROPE': { ru: 'Европа', uz: 'Yevropa' },
  'ASIA': { ru: 'Азия', uz: 'Osiyo' },
  'AS': { ru: 'Азия', uz: 'Osiyo' },
  'ME': { ru: 'Ближний Восток', uz: 'Yaqin Sharq' },
  'AF': { ru: 'Африка', uz: 'Afrika' },
  'AFRICA': { ru: 'Африка', uz: 'Afrika' },
  'AM': { ru: 'Америка', uz: 'Amerika' },
  'SA': { ru: 'Южная Америка', uz: 'Janubiy Amerika' },
  'NA': { ru: 'Северная Америка', uz: 'Shimoliy Amerika' },
  'LATAM': { ru: 'Латинская Америка', uz: 'Lotin Amerika' },
  'OC': { ru: 'Океания', uz: 'Okeaniya' },
  'OCEANIA': { ru: 'Океания', uz: 'Okeaniya' },
  'GL': { ru: 'Глобальный', uz: 'Global' },
  'GLOBAL': { ru: 'Глобальный', uz: 'Global' },
  'CIS': { ru: 'СНГ', uz: 'MDH' },
  'SEA': { ru: 'Юго-Восточная Азия', uz: 'Janubi-Sharqiy Osiyo' },
  'MENA': { ru: 'Ближний Восток и Африка', uz: 'Yaqin Sharq va Afrika' },
  'CARIBBEAN': { ru: 'Карибский регион', uz: 'Karib mintaqasi' },
  'BALKANS': { ru: 'Балканы', uz: 'Balkanlar' },
  'NORDIC': { ru: 'Скандинавия', uz: 'Skandinaviya' },
};

/**
 * Parse a regional/global slug to extract localized info.
 * Handles: EU-43_20_30, GL-120_1_30, SA-18_5_30, ASIA-12_3_Daily, etc.
 *
 * @param {string} slug - Package slug
 * @param {string} lang - Language code (ru, uz)
 * @returns {object|null} { regionPrefix, regionName, countryCount, isGlobal, dataAmount, days }
 */
export const parseRegionalSlug = (slug, lang = 'ru') => {
  if (!slug) return null;

  const parts = slug.split('-');
  if (parts.length < 2) return null;

  const regionPrefix = parts[0].toUpperCase();
  const entry = SLUG_PREFIX_MAP[regionPrefix];

  // Only treat as regional/global if the prefix is known
  if (!entry) return null;

  const rest = parts.slice(1).join('-'); // e.g. "43_20_30" or "120_1_Daily"
  const segments = rest.split('_');
  const countryCount = parseInt(segments[0], 10);
  const dataAmount = segments.length > 1 ? parseFloat(segments[1]) : 0;
  const daysOrType = segments.length > 2 ? segments[2] : '';
  const days = /daily/i.test(daysOrType) ? null : parseInt(daysOrType, 10) || 0;

  const isGlobal = regionPrefix === 'GL' || regionPrefix === 'GLOBAL';

  return {
    regionPrefix,
    regionName: entry[lang] || entry.ru,
    countryCount: isNaN(countryCount) ? 0 : countryCount,
    isGlobal,
    dataAmount,
    days,
    isDaily: /daily/i.test(daysOrType),
  };
};

/**
 * Generate a localized title for a regional/global package card.
 * E.g. "Южная Америка 5GB / 30 дней"
 *
 * @param {object} plan - Plan object with slug, data, days
 * @param {string} lang - Language code
 * @returns {string|null} Localized title, or null if not a regional/global package
 */
export const getLocalizedPackageTitle = (plan, lang = 'ru') => {
  const info = parseRegionalSlug(plan.slug || plan.id, lang);
  if (!info) return null;

  const dataDisplay = plan.data || (info.dataAmount >= 1 ? `${info.dataAmount}GB` : `${Math.round(info.dataAmount * 1024)}MB`);
  const daysDisplay = plan.days || info.days || '';
  const daysLabel = lang === 'uz' ? 'kun' : 'дней';

  return `${info.regionName} ${dataDisplay} / ${daysDisplay} ${daysLabel}`;
};

/**
 * Extract covered countries from packages
 * @param {Array} packages - Array of packages
 * @returns {Array} Array of unique country objects {code, name, logo}
 */
const extractCoveredCountries = (packages) => {
  const countryMap = new Map();

  packages.forEach(pkg => {
    if (pkg.locationNetworkList && Array.isArray(pkg.locationNetworkList)) {
      pkg.locationNetworkList.forEach(location => {
        if (!countryMap.has(location.locationCode)) {
          countryMap.set(location.locationCode, {
            code: location.locationCode,
            name: location.locationName,
            logo: location.locationLogo
          });
        }
      });
    }
  });

  return Array.from(countryMap.values());
};

/**
 * Group packages by region
 * @param {Array} packages - Array of all regional packages
 * @returns {Object} Grouped packages by region code
 */
export const groupPackagesByRegion = (packages) => {
  const grouped = {};

  packages.forEach(pkg => {
    const regionCode = detectRegion(pkg.locationCode);

    if (!grouped[regionCode]) {
      grouped[regionCode] = {
        regionCode,
        packages: [],
        packageCount: 0,
        coveredCountries: []
      };
    }

    grouped[regionCode].packages.push(pkg);
  });

  // Post-process: extract countries and counts
  Object.keys(grouped).forEach(regionCode => {
    const group = grouped[regionCode];
    group.packageCount = group.packages.length;
    group.coveredCountries = extractCoveredCountries(group.packages);
    group.countryCount = group.coveredCountries.length;
  });

  return grouped;
};

/**
 * Check if cache metadata is valid
 * @param {string} cacheType - 'regional' or 'global'
 * @returns {Promise<boolean>} True if cache is valid
 */
export const isCacheValid = async (cacheType) => {
  try {
    const { data, error } = await supabase
      .from('package_cache_metadata')
      .select('*')
      .eq('cache_type', cacheType)
      .single();

    if (error) {
      console.error(`[PackageCache] Error checking cache metadata for ${cacheType}:`, error);
      return false;
    }

    if (!data) {
      console.log(`[PackageCache] No cache metadata found for ${cacheType}`);
      return false;
    }

    const isValid = data.is_valid && new Date(data.expires_at) > new Date();
    console.log(`[PackageCache] Cache ${cacheType} valid:`, isValid);

    return isValid;
  } catch (error) {
    console.error(`[PackageCache] Exception checking cache validity for ${cacheType}:`, error);
    return false;
  }
};

/**
 * Get cached regional packages from Supabase
 * @returns {Promise<Object|null>} Grouped regional packages or null if cache miss
 */
export const getCachedRegionalPackages = async () => {
  try {
    console.log('[PackageCache] Checking regional packages cache...');

    // Check if cache is valid
    const valid = await isCacheValid('regional');
    if (!valid) {
      console.log('[PackageCache] Regional cache invalid or expired');
      return null;
    }

    // Fetch cached data
    const { data, error } = await supabase
      .from('cached_regional_packages')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('region_code');

    if (error) {
      console.error('[PackageCache] Error fetching regional packages:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[PackageCache] No regional packages in cache');
      return null;
    }

    console.log(`[PackageCache] Found ${data.length} regional groups in cache`);

    // Transform to grouped format
    const grouped = {};
    data.forEach(row => {
      grouped[row.region_code] = {
        regionCode: row.region_code,
        regionName: row.region_name,
        packages: row.packages,
        packageCount: row.package_count,
        countryCount: row.country_count,
        coveredCountries: row.covered_countries,
        cachedAt: row.cached_at
      };
    });

    return grouped;
  } catch (error) {
    console.error('[PackageCache] Exception fetching regional packages:', error);
    return null;
  }
};

/**
 * Get cached global packages from Supabase
 * @returns {Promise<Array|null>} Array of global packages or null if cache miss
 */
export const getCachedGlobalPackages = async () => {
  try {
    console.log('[PackageCache] Checking global packages cache...');

    // Check if cache is valid
    const valid = await isCacheValid('global');
    if (!valid) {
      console.log('[PackageCache] Global cache invalid or expired');
      return null;
    }

    // Fetch cached data
    const { data, error } = await supabase
      .from('cached_global_packages')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('price', { ascending: true });

    if (error) {
      console.error('[PackageCache] Error fetching global packages:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('[PackageCache] No global packages in cache');
      return null;
    }

    console.log(`[PackageCache] Found ${data.length} global packages in cache`);

    // Extract package_data from each row
    return data.map(row => row.package_data);
  } catch (error) {
    console.error('[PackageCache] Exception fetching global packages:', error);
    return null;
  }
};

/**
 * Save regional packages to cache
 * @param {Object} groupedPackages - Packages grouped by region
 * @returns {Promise<boolean>} True if save successful
 */
export const saveRegionalPackagesToCache = async (groupedPackages) => {
  try {
    console.log('[PackageCache] Saving regional packages to cache...');

    // Delete existing cache
    await supabase.from('cached_regional_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS).toISOString();
    const rows = [];

    Object.entries(groupedPackages).forEach(([regionCode, group]) => {
      rows.push({
        region_code: regionCode,
        region_name: getRegionName(regionCode, 'en'),
        packages: group.packages,
        country_count: group.countryCount || 0,
        package_count: group.packageCount || group.packages.length,
        covered_countries: group.coveredCountries || [],
        cached_at: new Date().toISOString(),
        expires_at: expiresAt
      });
    });

    // Insert in batches (Supabase has a limit)
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase
        .from('cached_regional_packages')
        .insert(batch);

      if (error) {
        console.error('[PackageCache] Error inserting regional batch:', error);
        return false;
      }
    }

    // Update metadata
    await supabase
      .from('package_cache_metadata')
      .upsert({
        cache_type: 'regional',
        last_updated: new Date().toISOString(),
        expires_at: expiresAt,
        total_records: rows.length,
        is_valid: true
      }, {
        onConflict: 'cache_type'
      });

    console.log(`[PackageCache] Saved ${rows.length} regional groups to cache`);
    return true;
  } catch (error) {
    console.error('[PackageCache] Exception saving regional packages:', error);
    return false;
  }
};

/**
 * Save global packages to cache
 * @param {Array} packages - Array of global packages
 * @returns {Promise<boolean>} True if save successful
 */
export const saveGlobalPackagesToCache = async (packages) => {
  try {
    console.log('[PackageCache] Saving global packages to cache...');

    // Delete existing cache
    await supabase.from('cached_global_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS).toISOString();
    const rows = packages.map(pkg => {
      const coveredCountries = extractCoveredCountries([pkg]);

      return {
        package_code: pkg.packageCode,
        slug: pkg.slug,
        name: pkg.name,
        package_data: pkg,
        price: pkg.price / 10000,
        volume: pkg.volume,
        duration: pkg.duration,
        country_count: coveredCountries.length,
        covered_countries: coveredCountries,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt
      };
    });

    // Insert in batches
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase
        .from('cached_global_packages')
        .insert(batch);

      if (error) {
        console.error('[PackageCache] Error inserting global batch:', error);
        return false;
      }
    }

    // Update metadata
    await supabase
      .from('package_cache_metadata')
      .upsert({
        cache_type: 'global',
        last_updated: new Date().toISOString(),
        expires_at: expiresAt,
        total_records: rows.length,
        is_valid: true
      }, {
        onConflict: 'cache_type'
      });

    console.log(`[PackageCache] Saved ${rows.length} global packages to cache`);
    return true;
  } catch (error) {
    console.error('[PackageCache] Exception saving global packages:', error);
    return false;
  }
};

/**
 * Invalidate cache (force refresh on next fetch)
 * @param {string} cacheType - 'regional' or 'global' or 'all'
 * @returns {Promise<boolean>} True if invalidation successful
 */
export const invalidateCache = async (cacheType = 'all') => {
  try {
    console.log(`[PackageCache] Invalidating ${cacheType} cache...`);

    if (cacheType === 'all') {
      await supabase
        .from('package_cache_metadata')
        .update({ is_valid: false })
        .in('cache_type', ['regional', 'global']);
    } else {
      await supabase
        .from('package_cache_metadata')
        .update({ is_valid: false })
        .eq('cache_type', cacheType);
    }

    console.log(`[PackageCache] Cache ${cacheType} invalidated`);
    return true;
  } catch (error) {
    console.error('[PackageCache] Exception invalidating cache:', error);
    return false;
  }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache stats
 */
export const getCacheStats = async () => {
  try {
    const { data: metadata } = await supabase
      .from('package_cache_metadata')
      .select('*');

    const { count: regionalCount } = await supabase
      .from('cached_regional_packages')
      .select('*', { count: 'exact', head: true });

    const { count: globalCount } = await supabase
      .from('cached_global_packages')
      .select('*', { count: 'exact', head: true });

    return {
      metadata: metadata || [],
      regionalCount: regionalCount || 0,
      globalCount: globalCount || 0
    };
  } catch (error) {
    console.error('[PackageCache] Error fetching cache stats:', error);
    return null;
  }
};
