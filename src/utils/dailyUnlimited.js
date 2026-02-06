// src/utils/dailyUnlimited.js
// Helper functions for Daily Unlimited eSIM plans

/**
 * Check if a package is a Daily Unlimited plan
 * Daily Unlimited plans have dataType = 4 or dataType = 2
 */
export const isDailyUnlimited = (pkg) => {
  return pkg.dataType === 4 || pkg.dataType === 2;
};

/**
 * Extract daily data amount from slug for Daily Unlimited plans
 * Examples: TH_1_Daily -> 1GB/day, CN_0.5_daily -> 500MB/day
 */
export const getDailyDataAmount = (pkg) => {
  if (!isDailyUnlimited(pkg)) return null;

  // Try to extract from slug
  const slug = pkg.slug || '';
  const parts = slug.split('_');

  if (parts.length >= 2) {
    const dataAmount = parseFloat(parts[1]);
    if (!isNaN(dataAmount)) {
      if (dataAmount >= 1) {
        return `${Math.round(dataAmount)}GB/day`;
      } else {
        return `${Math.round(dataAmount * 1024)}MB/day`;
      }
    }
  }

  // Fallback: use volume / days if available
  if (pkg.volume && pkg.days && pkg.days > 0) {
    const dailyBytes = pkg.volume / pkg.days;
    const dailyGB = dailyBytes / (1024 * 1024 * 1024);

    if (dailyGB >= 1) {
      return `${Math.round(dailyGB)}GB/day`;
    } else {
      const dailyMB = dailyBytes / (1024 * 1024);
      return `${Math.round(dailyMB)}MB/day`;
    }
  }

  return null;
};

/**
 * Get FUP (Fair Usage Policy) speed info from slug
 * Examples: CN_2_daily_1mbps -> "1 Mbps", TH_1_Daily -> "128-512 Kbps"
 */
export const getFUPSpeed = (pkg) => {
  if (!isDailyUnlimited(pkg)) return null;

  const slug = pkg.slug || '';
  const lowerSlug = slug.toLowerCase();

  if (lowerSlug.includes('_2mbps')) {
    return '2 Mbps';
  } else if (lowerSlug.includes('_1mbps')) {
    return '1 Mbps';
  } else {
    return '128-512 Kbps';
  }
};

/**
 * Get discount percentage based on number of days
 * 1-4 days: 4% off
 * 5-9 days: 8% off
 * 10-19 days: 11% off
 * 20-29 days: 15% off
 * 30-365 days: 18% off
 */
export const getDiscountPercent = (days) => {
  if (days >= 30 && days <= 365) return 18;
  if (days >= 20 && days < 30) return 15;
  if (days >= 10 && days < 20) return 11;
  if (days >= 5 && days < 10) return 8;
  if (days >= 1 && days < 5) return 4;
  return 0;
};

/**
 * Calculate price with discount applied
 */
export const calculateDiscountedPrice = (basePrice, days) => {
  const discountPercent = getDiscountPercent(days);
  const discount = (basePrice * discountPercent) / 100;
  return basePrice - discount;
};

/**
 * Get all discount tiers for display
 */
export const getDiscountTiers = () => {
  return [
    { days: '1-4', discount: 4 },
    { days: '5-9', discount: 8 },
    { days: '10-19', discount: 11 },
    { days: '20-29', discount: 15 },
    { days: '30-365', discount: 18 },
  ];
};

/**
 * Get dataType description
 */
export const getDataTypeDescription = (dataType) => {
  switch (dataType) {
    case 1:
      return 'Total Data (Fixed)';
    case 2:
      return 'Daily Limit (Speed Reduced)';
    case 3:
      return 'Daily Limit (Service Cut-off)';
    case 4:
      return 'Daily Unlimited';
    default:
      return 'Unknown';
  }
};

/**
 * Format dataType description for user display (i18n)
 */
export const getDataTypeLabel = (dataType, lang = 'ru') => {
  const labels = {
    ru: {
      1: 'Фиксированный объем',
      2: 'Дневной лимит (сниженная скорость)',
      3: 'Дневной лимит (отключение)',
      4: 'Безлимит ежедневно',
    },
    uz: {
      1: 'Belgilangan hajm',
      2: 'Kunlik limit (kamaytirilgan tezlik)',
      3: 'Kunlik limit (o\'chirish)',
      4: 'Kunlik cheksiz',
    },
    en: {
      1: 'Fixed Data',
      2: 'Daily Limit (Speed Reduced)',
      3: 'Daily Limit (Cut-off)',
      4: 'Daily Unlimited',
    },
  };

  return labels[lang]?.[dataType] || labels.en[dataType] || 'Unknown';
};
