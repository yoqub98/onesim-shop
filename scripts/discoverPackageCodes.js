// scripts/discoverPackageCodes.js
// Run this script to get actual packageCodes for your static config
// Usage: node scripts/discoverPackageCodes.js

const COUNTRIES = [
  { code: 'TH', name: 'Thailand' },
  { code: 'AE', name: 'UAE' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'CN', name: 'China' },
  { code: 'TR', name: 'Turkey' },
  { code: 'GE', name: 'Georgia' },
  { code: 'IT', name: 'Italy' },
  { code: 'FR', name: 'France' },
  { code: 'AZ', name: 'Azerbaijan' },
];

const API_URL = 'http://localhost:5000/api'; // Change to your proxy URL

async function fetchPackages(countryCode) {
  const response = await fetch(`${API_URL}/packages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locationCode: countryCode,
      type: '',
      slug: '',
      packageCode: '',
      iccid: '',
    }),
  });

  const data = await response.json();
  return data.success ? data.obj.packageList : [];
}

function findBestPackage(packages) {
  // Target: 20GB, 30 days
  const TARGET_GB = 20;
  const TARGET_DAYS = 30;

  const transformed = packages.map(pkg => ({
    packageCode: pkg.packageCode,
    name: pkg.name,
    gb: Math.round(pkg.volume / 1073741824),
    days: pkg.duration,
    price: pkg.price / 10000,
  }));

  // Try exact match
  let best = transformed.find(
    p => p.gb === TARGET_GB && p.days === TARGET_DAYS
  );

  if (best) return best;

  // Try 20GB with any duration
  const twentyGB = transformed.filter(p => p.gb === TARGET_GB);
  if (twentyGB.length > 0) {
    twentyGB.sort((a, b) => Math.abs(a.days - TARGET_DAYS) - Math.abs(b.days - TARGET_DAYS));
    return twentyGB[0];
  }

  // Try closest to 20GB and 30 days
  transformed.sort((a, b) => {
    const diffA = Math.abs(a.gb - TARGET_GB) + Math.abs(a.days - TARGET_DAYS);
    const diffB = Math.abs(b.gb - TARGET_GB) + Math.abs(b.days - TARGET_DAYS);
    return diffA - diffB;
  });

  return transformed[0];
}

async function discoverAll() {
  console.log('🔍 Discovering best packageCodes for static config...\n');
  console.log('export const STATIC_PACKAGE_CODES = {');

  for (const country of COUNTRIES) {
    try {
      console.log(`  // Fetching ${country.name}...`);
      const packages = await fetchPackages(country.code);
      
      if (packages.length === 0) {
        console.log(`  ${country.code}: null, // ❌ No packages found`);
        continue;
      }

      const best = findBestPackage(packages);
      console.log(`  ${country.code}: '${best.packageCode}', // ${country.name} ${best.gb}GB ${best.days}days $${best.price}`);
      
    } catch (error) {
      console.log(`  ${country.code}: null, // ❌ Error: ${error.message}`);
    }
  }

  console.log('};');
  console.log('\n✅ Copy the output above to src/config/staticPackages.js');
}

discoverAll().catch(console.error);