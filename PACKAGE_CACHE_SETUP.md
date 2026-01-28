# Package Cache Setup Guide

This guide explains how to set up and use the package caching system that stores regional and global packages in Supabase to improve performance and reduce API calls.

## Overview

The package cache system:
- **Caches regional and global packages** in Supabase for 1 week
- **Groups regional packages** by thematic regions (Europe, Asia, Middle East, etc.)
- **Reduces API calls** by serving cached data
- **Improves loading speed** significantly
- **Automatically refreshes** when cache expires or becomes invalid

## Architecture

### Database Tables

1. **cached_regional_packages** - Stores grouped regional packages
2. **cached_global_packages** - Stores global packages
3. **package_cache_metadata** - Tracks cache validity and expiration

### Services

- **packageCacheService.js** - Handles all cache operations
- **esimAccessApi.js** - Updated to use cache automatically

## Setup Instructions

### Step 1: Apply the Database Migration

The migration file is located at: `supabase/migrations/004_create_package_cache_tables.sql`

**Option A: Using Supabase CLI**

```bash
# Make sure you're in the project directory
cd D:\webapp\onesim-shop

# Apply the migration
supabase db push

# Or apply specific migration
supabase migration up
```

**Option B: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/004_create_package_cache_tables.sql`
4. Copy the entire SQL content
5. Paste into the SQL Editor
6. Click **Run** to execute

**Option C: Manual Table Creation**

If you prefer to create tables manually, you can copy the SQL from the migration file and run it in your Supabase SQL editor.

### Step 2: Verify Table Creation

Check that all tables were created:

```sql
-- Run this in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'cached_%'
  OR table_name = 'package_cache_metadata';
```

You should see:
- `cached_regional_packages`
- `cached_global_packages`
- `package_cache_metadata`

### Step 3: Verify RLS Policies

```sql
-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('cached_regional_packages', 'cached_global_packages', 'package_cache_metadata');
```

### Step 4: Test the Cache

The cache will automatically populate on the first request:

1. Start your application: `npm start`
2. Navigate to the Destinations page
3. Click on the **Regional** tab
4. Check browser console for cache logs:
   - First load: `⚠️ Cache miss - fetching from API...`
   - Subsequent loads: `✅ Using cached regional packages`

## How It Works

### First Request (Cache Miss)

```
User clicks Regional tab
  ↓
fetchRegionalPackages() called
  ↓
Check Supabase cache → Cache empty
  ↓
Fetch all packages from API
  ↓
Filter regional packages (!RG prefix)
  ↓
Group by thematic regions
  ↓
Save to Supabase cache (expires in 7 days)
  ↓
Return grouped data to UI
```

### Subsequent Requests (Cache Hit)

```
User clicks Regional tab
  ↓
fetchRegionalPackages() called
  ↓
Check Supabase cache → Cache valid
  ↓
Return cached data instantly (no API call)
```

## Region Definitions

Packages are grouped into thematic regions:

| Region Code | Name | Patterns | Icon |
|------------|------|----------|------|
| EU | Europe | EU-, EUROPE- | 🇪🇺 |
| ASIA | Asia | ASIA-, AS- | 🌏 |
| ME | Middle East | ME-, MIDDLEEAST- | 🕌 |
| AM | Americas | AM-, AMERICAS-, LATAM- | 🌎 |
| AF | Africa | AF-, AFRICA- | 🌍 |
| OC | Oceania | OC-, OCEANIA-, PACIFIC- | 🏝️ |
| GLOBAL | Global | !GL, GLOBAL- | 🌐 |

These regions are localized in Russian and Uzbek languages.

## Cache Management

### Check Cache Status

```javascript
import { getCacheStats } from './services/packageCacheService';

const stats = await getCacheStats();
console.log('Cache Statistics:', stats);
```

Output:
```javascript
{
  metadata: [
    { cache_type: 'regional', last_updated: '2026-01-28T...', expires_at: '2026-02-04T...', total_records: 6, is_valid: true },
    { cache_type: 'global', last_updated: '2026-01-28T...', expires_at: '2026-02-04T...', total_records: 45, is_valid: true }
  ],
  regionalCount: 6,
  globalCount: 45
}
```

### Manually Invalidate Cache

To force a cache refresh:

```javascript
import { invalidateCache } from './services/packageCacheService';

// Invalidate specific cache
await invalidateCache('regional'); // or 'global'

// Invalidate all caches
await invalidateCache('all');
```

After invalidation, the next request will fetch fresh data from the API.

### Direct SQL Cache Management

**View cache status:**
```sql
SELECT * FROM package_cache_metadata;
```

**Invalidate cache:**
```sql
UPDATE package_cache_metadata SET is_valid = false WHERE cache_type = 'regional';
UPDATE package_cache_metadata SET is_valid = false WHERE cache_type = 'global';
```

**Clear all cached data:**
```sql
DELETE FROM cached_regional_packages;
DELETE FROM cached_global_packages;
UPDATE package_cache_metadata SET is_valid = false, total_records = 0;
```

**Check cache expiration:**
```sql
SELECT
  cache_type,
  last_updated,
  expires_at,
  CASE
    WHEN expires_at > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status,
  total_records
FROM package_cache_metadata;
```

## Cache Lifecycle

### Automatic Refresh

The cache automatically expires after **7 days**. When expired:
1. Next request detects expired cache
2. Fetches fresh data from API
3. Updates cache with new data and new expiration date

### Manual Refresh

To force immediate refresh:
1. Invalidate cache (see above)
2. Navigate to Regional/Global tab
3. System will fetch fresh data and update cache

## Monitoring & Debugging

### Console Logs

The cache system provides detailed console logging:

```
[PackageCache] Checking regional packages cache...
[PackageCache] Regional cache invalid or expired
⚠️ Cache miss - fetching from API...
✅ Received 250 total packages
🌍 Filtered 120 regional packages
📦 Found 6 thematic regions: [ 'EU', 'ASIA', 'ME', 'AM', 'AF', 'OC' ]
[PackageCache] Saved 6 regional groups to cache
```

### Common Issues

**Issue: Cache not being used**
- Check that migration was applied successfully
- Verify RLS policies are configured
- Check Supabase environment variables in `.env`

**Issue: Cache always invalid**
- Check `package_cache_metadata` table
- Verify `is_valid` column is `true`
- Check `expires_at` is in the future

**Issue: Missing regional groups**
- Check console logs for grouping results
- Verify API response contains packages with correct locationCode patterns

## Performance Benefits

### Before Caching

- **Regional packages fetch**: ~5-10 seconds (large API response)
- **Global packages fetch**: ~5-10 seconds
- Every tab switch triggers full API fetch

### After Caching

- **First load**: ~5-10 seconds (cache population)
- **Subsequent loads**: ~100-500ms (from Supabase cache)
- Cache valid for 7 days (no API calls during this period)

**Estimated API call reduction**: 95%+ for regional/global packages

## Environment Variables

Ensure these are set in your `.env` file:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Migration History

- **004_create_package_cache_tables.sql** - Initial cache tables creation
  - Created: 2026-01-28
  - Purpose: Implement package caching for regional and global packages
  - Cache Duration: 7 days

## API Reference

### packageCacheService.js Functions

```javascript
// Check if cache is valid
await isCacheValid('regional' | 'global')

// Get cached data
await getCachedRegionalPackages()
await getCachedGlobalPackages()

// Save to cache
await saveRegionalPackagesToCache(groupedPackages)
await saveGlobalPackagesToCache(packages)

// Invalidate cache
await invalidateCache('regional' | 'global' | 'all')

// Get cache statistics
await getCacheStats()

// Region utilities
detectRegion(locationCode)
getRegionName(regionCode, lang)
groupPackagesByRegion(packages)
```

## Future Enhancements

Potential improvements:
1. **Admin panel** - UI for cache management
2. **Automatic background refresh** - Scheduled job to update cache before expiration
3. **Partial cache updates** - Update specific regions without full refresh
4. **Cache warmup** - Pre-populate cache on app startup
5. **Analytics** - Track cache hit rates and performance metrics

## Support

For issues or questions:
- Check console logs for detailed error messages
- Verify Supabase connection and permissions
- Review RLS policies in Supabase dashboard
- Contact development team if issues persist
