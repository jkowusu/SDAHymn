import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { SearchBar } from '@/components/SearchBar';
import { HymnCard } from '@/components/HymnCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDatabase } from '@/hooks/useDatabase';
import { useFavorites } from '@/hooks/useFavorites';
import { HymnSearchResult } from '@/types/hymn';

export default function HomeTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HymnSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { searchHymns, isLoading: dbLoading, error } = useDatabase();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchHymns(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHymnPress = (hymnId: number) => {
    router.push(`/hymn/${hymnId}`);
  };

  const handleFavoritePress = (hymnId: number) => {
    toggleFavorite(hymnId);
  };

  if (dbLoading) {
    return <LoadingSpinner message="Loading hymnal..." />;
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
        <Text style={styles.title}>SDA Hymnal</Text>
        <Text style={styles.subtitle}>Search by hymn number or title</Text>
      </View>
      
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Enter hymn number or search title..."
      />

      {isSearching ? (
        <LoadingSpinner message="Searching..." />
      ) : searchQuery.trim() && searchResults.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No hymns found</Text>
          <Text style={styles.noResultsSubtext}>
            Try searching by hymn number or part of the title
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HymnCard
              hymn={item}
              onPress={() => handleHymnPress(item.id)}
              onFavoritePress={() => handleFavoritePress(item.id)}
              isFavorite={isFavorite(item.id)}
              showSnippet={true}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!searchQuery.trim() && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to SDA Hymnal</Text>
          <Text style={styles.welcomeText}>
            Search for hymns by number or title above, or browse all hymns in the Hymns tab.
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
    flex: 1,
    justifyContent: 'center',
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
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
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