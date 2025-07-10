import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { SearchBar } from '@/components/SearchBar';
import { HymnCard } from '@/components/HymnCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDatabase } from '@/hooks/useDatabase';
import { useFavorites } from '@/hooks/useFavorites';
import { Hymn } from '@/types/hymn';

export default function ListTab() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [filteredHymns, setFilteredHymns] = useState<Hymn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { getAllHymns, isLoading, error } = useDatabase();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    loadHymns();
  }, []);

  useEffect(() => {
    filterHymns();
  }, [searchQuery, hymns]);

  const loadHymns = async () => {
    try {
      const allHymns = await getAllHymns();
      setHymns(allHymns);
      setFilteredHymns(allHymns);
    } catch (error) {
      console.error('Failed to load hymns:', error);
    }
  };

  const filterHymns = () => {
    if (!searchQuery.trim()) {
      setFilteredHymns(hymns);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = hymns.filter(hymn => 
      hymn.title.toLowerCase().includes(query) ||
      hymn.id.toString().includes(query)
    );
    setFilteredHymns(filtered);
  };

  const handleHymnPress = (hymnId: number) => {
    router.push(`/hymn/${hymnId}`);
  };

  const handleFavoritePress = (hymnId: number) => {
    toggleFavorite(hymnId);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading hymns..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Hymns</Text>
        <Text style={styles.subtitle}>{hymns.length} hymns available</Text>
      </View>
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Filter hymns..."
      />

      <FlatList
        data={filteredHymns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <HymnCard
            hymn={item}
            onPress={() => handleHymnPress(item.id)}
            onFavoritePress={() => handleFavoritePress(item.id)}
            isFavorite={isFavorite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 88,
          offset: 88 * index,
          index,
        })}
      />

      {filteredHymns.length === 0 && searchQuery.trim() && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No hymns found</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search terms
          </Text>
        </View>
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
    paddingBottom: 10,
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
  noResults: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});