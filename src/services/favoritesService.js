// src/services/favoritesService.js
// Service for managing user favorites (liked eSIM packages)
import { supabase } from '../lib/supabaseClient.js';

/**
 * Get all favorite package IDs for a user
 * @param {string} userId - User ID
 * @returns {Promise<string[]>} Array of package IDs
 */
export const getUserFavorites = async (userId) => {
  try {
    console.log('[Favorites] Fetching favorites for user:', userId);

    const { data, error } = await supabase
      .from('user_favorites')
      .select('package_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Favorites] Error fetching favorites:', error);
      throw error;
    }

    const favoriteIds = data.map(item => item.package_id);
    console.log('[Favorites] Found', favoriteIds.length, 'favorites');
    return favoriteIds;
  } catch (error) {
    console.error('[Favorites] Error in getUserFavorites:', error);
    throw error;
  }
};

/**
 * Add a package to user favorites
 * @param {string} userId - User ID
 * @param {string} packageId - Package ID
 * @returns {Promise<boolean>} Success status
 */
export const addToFavorites = async (userId, packageId) => {
  try {
    console.log('[Favorites] Adding to favorites:', { userId, packageId });

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        package_id: packageId,
      });

    if (error) {
      // If it's a duplicate key error, it's already favorited - return success
      if (error.code === '23505') {
        console.log('[Favorites] Package already in favorites');
        return true;
      }
      console.error('[Favorites] Error adding to favorites:', error);
      throw error;
    }

    console.log('[Favorites] Successfully added to favorites');
    return true;
  } catch (error) {
    console.error('[Favorites] Error in addToFavorites:', error);
    throw error;
  }
};

/**
 * Remove a package from user favorites
 * @param {string} userId - User ID
 * @param {string} packageId - Package ID
 * @returns {Promise<boolean>} Success status
 */
export const removeFromFavorites = async (userId, packageId) => {
  try {
    console.log('[Favorites] Removing from favorites:', { userId, packageId });

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('package_id', packageId);

    if (error) {
      console.error('[Favorites] Error removing from favorites:', error);
      throw error;
    }

    console.log('[Favorites] Successfully removed from favorites');
    return true;
  } catch (error) {
    console.error('[Favorites] Error in removeFromFavorites:', error);
    throw error;
  }
};

/**
 * Toggle favorite status for a package
 * @param {string} userId - User ID
 * @param {string} packageId - Package ID
 * @param {boolean} isFavorited - Current favorite status
 * @returns {Promise<boolean>} New favorite status
 */
export const toggleFavorite = async (userId, packageId, isFavorited) => {
  try {
    if (isFavorited) {
      await removeFromFavorites(userId, packageId);
      return false;
    } else {
      await addToFavorites(userId, packageId);
      return true;
    }
  } catch (error) {
    console.error('[Favorites] Error in toggleFavorite:', error);
    throw error;
  }
};

/**
 * Check if a package is favorited by user
 * @param {string} userId - User ID
 * @param {string} packageId - Package ID
 * @returns {Promise<boolean>} Is favorited
 */
export const isFavorited = async (userId, packageId) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('package_id')
      .eq('user_id', userId)
      .eq('package_id', packageId)
      .single();

    if (error) {
      // If no rows found, it's not favorited
      if (error.code === 'PGRST116') {
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('[Favorites] Error checking if favorited:', error);
    return false;
  }
};
