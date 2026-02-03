# Favorites Feature Setup Guide

This guide explains how to set up the favorites functionality for your OneSim eSIM Shop.

## Database Setup (Supabase)

### Step 1: Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_migration_user_favorites.sql` from this project
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the migration

This will create:
- `user_favorites` table with proper schema
- Indexes for optimized queries
- Row Level Security (RLS) policies for data protection
- Proper permissions for authenticated users

### Step 2: Verify the Migration

After running the migration, verify it was successful:

1. Go to **Table Editor** in Supabase dashboard
2. Look for the `user_favorites` table
3. Check that it has the following columns:
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `package_id` (text)
   - `created_at` (timestamp)

### Step 3: Test the Feature

1. **Frontend**: The feature is already implemented and ready to use!
2. **Login**: Sign in to your account
3. **Add Favorites**: Click the heart icon on any eSIM plan card
4. **View Favorites**: Go to "My Page" → "Избранное" tab to see your favorite eSIMs

## Features Implemented

### Frontend Components

1. **FavoritesContext** (`src/contexts/FavoritesContext.jsx`)
   - Global state management for favorites
   - Optimistic UI updates
   - Auto-sync with backend

2. **FavoritesService** (`src/services/favoritesService.js`)
   - Add/remove favorites
   - Check favorite status
   - Get user favorites list

3. **DataPlanRow** (`src/components/DataPlanRow.jsx`)
   - Heart icon toggles favorite status
   - Visual feedback (filled heart when favorited)
   - Toast notifications on add/remove
   - Dark gray color when favorited

4. **MyFavorites Page** (`src/pages/MyFavorites.jsx`)
   - New tab in My Page
   - Lists all favorite eSIMs using DataPlanRow component
   - Empty state with helpful message
   - Click to view package details

### User Experience

- **Heart Icon States**:
  - Outlined: Not favorited
  - Filled with dark gray: Favorited
  - Hover: Orange color

- **Toast Notifications**:
  - "Добавлено в избранное" - When adding
  - "Удалено из избранного" - When removing
  - "Войдите в аккаунт" - When not logged in
  - Error messages if something goes wrong

- **My Page Tab**:
  - "Избранное" tab with heart icon
  - Shows count badge when favorites exist
  - Desktop layout reuses DataPlanRow component
  - Responsive design

## API Reference

### Functions Available

```javascript
// Context Hook
import { useFavorites } from './contexts/FavoritesContext';

const {
  favoriteIds,      // Array of favorited package IDs
  isFavorited,      // Function to check if a package is favorited
  toggleFavorite,   // Function to add/remove favorite
  loading,          // Loading state
  refreshFavorites  // Manual refresh function
} = useFavorites();
```

### Service Functions

```javascript
// Direct service calls (usually not needed, use context instead)
import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  isFavorited
} from './services/favoritesService';
```

## Troubleshooting

### Migration Issues

**Problem**: "relation user_favorites already exists"
- **Solution**: The table already exists. No action needed.

**Problem**: RLS policies not working
- **Solution**:
  1. Check that RLS is enabled: `ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;`
  2. Verify policies exist in Supabase Dashboard → Authentication → Policies

### Frontend Issues

**Problem**: Favorites not persisting
- **Check**: User is logged in (user?.id exists)
- **Check**: Supabase migration was run successfully
- **Check**: Browser console for errors

**Problem**: Heart icon not changing
- **Check**: FavoritesProvider is wrapping the app in App.jsx
- **Check**: Browser console for network errors

**Problem**: "Must be logged in" toast always showing
- **Check**: Auth context is working (user is authenticated)
- **Check**: AuthProvider is properly configured

## Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own favorites
- ✅ Foreign key constraint ensures valid user references
- ✅ Unique constraint prevents duplicate favorites
- ✅ Cascade delete removes favorites when user is deleted

## Performance

- ✅ Indexed columns for fast queries
- ✅ In-memory cache on frontend (FavoritesContext)
- ✅ Optimistic UI updates
- ✅ Batch fetching of package details

## Future Enhancements

Possible improvements:
- [ ] Share favorites with friends
- [ ] Favorite folders/categories
- [ ] Export favorites list
- [ ] Price drop notifications for favorites
- [ ] Favorite sync across devices (already works via Supabase)

## Support

If you encounter any issues:
1. Check Supabase logs for backend errors
2. Check browser console for frontend errors
3. Verify migration was run successfully
4. Check that all new files are committed to git
