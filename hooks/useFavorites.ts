import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'sda_hymnal_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: number[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = async (hymnId: number) => {
    const newFavorites = favorites.includes(hymnId)
      ? favorites.filter(id => id !== hymnId)
      : [...favorites, hymnId];
    
    await saveFavorites(newFavorites);
  };

  const isFavorite = (hymnId: number) => favorites.includes(hymnId);

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite
  };
}