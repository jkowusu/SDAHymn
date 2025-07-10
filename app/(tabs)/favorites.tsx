import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { HymnCard } from '@/components/HymnCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDatabase } from '@/hooks/useDatabase';
import { useFavorites } from '@/hooks/useFavorites';
import { Hymn } from '@/types/hymn';
import { Heart } from 'lucide-react-native';

export default function FavoritesTab() {
  const [favoriteHymns, setFavoriteHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getHymnById } = useDatabase();
  const { favorites, toggleFavorite, isLoading: favoritesLoading } = useFavorites();

  useEffect(() => {
    loadFavoriteHymns();
  }, [favorites]);

  const loadFavoriteHymns = async () => {
    if (favorites.length === 0) {
      setFavoriteHymns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const hymnPromises = favorites.map(id => getHymnById(id));
      const hymns = await Promise.all(hymnPromises);
      const validHymns = hymns.filter((hymn): hymn is Hymn => hymn !== null);
      
      // Sort by hymn number
      validHymns.sort((a, b) => a.id - b.id);
      setFavoriteHymns(validHymns);
    } catch (error) {
      console.error('Failed to load favorite hymns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHymnPress = (hymnId: number) => {
    router.push(`/hymn/${hymnId}`);
  };

  const handleFavoritePress = (hymnId: number) => {
    toggleFavorite(hymnId);
  };

  if (isLoading || favoritesLoading) {
    return <LoadingSpinner message="Loading favorites..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favoriteHymns.length} favorite hymn{favoriteHymns.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {favoriteHymns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on any hymn to add it to your favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteHymns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HymnCard
              hymn={item}
              onPress={() => handleHymnPress(item.id)}
              onFavoritePress={() => handleFavoritePress(item.id)}
              isFavorite={true}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});