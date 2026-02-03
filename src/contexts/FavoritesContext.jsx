// src/contexts/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserFavorites, toggleFavorite as toggleFavoriteService } from '../services/favoritesService';

const FavoritesContext = createContext({});

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch favorites when user logs in
  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    } else {
      // Clear favorites when user logs out
      setFavoriteIds([]);
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const ids = await getUserFavorites(user.id);
      setFavoriteIds(ids);
    } catch (error) {
      console.error('[FavoritesContext] Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = useCallback(async (packageId) => {
    if (!user?.id) {
      throw new Error('User must be logged in to favorite packages');
    }

    const isFavorited = favoriteIds.includes(packageId);

    try {
      // Optimistic update
      if (isFavorited) {
        setFavoriteIds(prev => prev.filter(id => id !== packageId));
      } else {
        setFavoriteIds(prev => [...prev, packageId]);
      }

      // Call backend
      await toggleFavoriteService(user.id, packageId, isFavorited);

      return !isFavorited; // Return new state
    } catch (error) {
      console.error('[FavoritesContext] Error toggling favorite:', error);
      // Revert optimistic update on error
      if (isFavorited) {
        setFavoriteIds(prev => [...prev, packageId]);
      } else {
        setFavoriteIds(prev => prev.filter(id => id !== packageId));
      }
      throw error;
    }
  }, [user?.id, favoriteIds]);

  const isFavorited = useCallback((packageId) => {
    return favoriteIds.includes(packageId);
  }, [favoriteIds]);

  const value = {
    favoriteIds,
    loading,
    toggleFavorite,
    isFavorited,
    refreshFavorites: loadFavorites,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
