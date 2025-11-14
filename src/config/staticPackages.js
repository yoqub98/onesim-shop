// src/config/staticPackages.js
// Pre-configured best packages for main page (fast loading)
// Update these periodically by checking the API manually

export const STATIC_PACKAGE_CODES = {
  // ASIA
  TH: 'esim-thailand-20gb-30days-5g', // Thailand 20GB 30 days
  AE: 'esim-uae-20gb-30days-5g', // UAE 20GB 30 days
  VN: 'esim-vietnam-20gb-30days-5g', // Vietnam 20GB 30 days
  MY: 'esim-malaysia-20gb-30days-5g', // Malaysia 20GB 30 days
  CN: 'esim-china-20gb-30days-5g', // China 20GB 30 days
  
  // EUROPE
  TR: 'esim-turkey-20gb-30days-5g', // Turkey 20GB 30 days
  GE: 'esim-georgia-20gb-30days-5g', // Georgia 20GB 30 days
  IT: 'esim-italy-20gb-30days-5g', // Italy 20GB 30 days
  FR: 'esim-france-20gb-30days-5g', // France 20GB 30 days
  AZ: 'esim-azerbaijan-20gb-30days-5g', // Azerbaijan 20GB 30 days
};

// Fallback criteria if static code doesn't work
export const FALLBACK_CRITERIA = {
  targetGB: 20,
  targetDays: 30,
  fallbackGB: [25, 15, 30, 10], // Try these GBs in order
  fallbackDays: [30, 15, 7, 60], // Try these days in order
};