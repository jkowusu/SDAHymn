import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Share,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Heart, Share2 } from 'lucide-react-native';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useDatabase } from '@/hooks/useDatabase';
import { useFavorites } from '@/hooks/useFavorites';
import { Hymn } from '@/types/hymn';


export default function HymnDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getHymnById } = useDatabase();
  const { toggleFavorite, isFavorite } = useFavorites();


  useEffect(() => {
    if (id) {
      loadHymn(parseInt(id));
    }
  }, [id])

  const loadHymn = async (hymnId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const hymnData = await getHymnById(hymnId);
      if (hymnData) {
        setHymn(hymnData);
      } else {
        console.log("Not found for some reason")
        setError('Hymn not found');
      }
    } catch (err) {
      setError('Failed to load hymn');
      console.error('Error loading hymn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoritePress = () => {
    if (hymn) {
      toggleFavorite(hymn.id);
    }
  };

  const handleShare = async () => {
    if (!hymn) return;

    try {
      const message = `${hymn.title} - Hymn #${hymn.id}\n\n${hymn.lyrics}`;
      
      if (Platform.OS === 'web') {
        // Web fallback
        if (navigator.share) {
          await navigator.share({
            title: `${hymn.title} - Hymn #${hymn.id}`,
            text: hymn.lyrics,
          });
        } else {
          // Fallback for web browsers without Web Share API
          await navigator.clipboard.writeText(message);
          alert('Hymn copied to clipboard!');
        }
      } else {
        await Share.share({
          message,
          title: `${hymn.title} - Hymn #${hymn.id}`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatLyrics = (lyrics: string) => {
    // Split by double newlines to separate verses/sections
    const sections = lyrics.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => (
      <View key={index} style={styles.verseContainer}>
        <Text style={styles.verseText}>{section.trim()}</Text>
      </View>
    ));
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading hymn..." />;
  }

  if (error || !hymn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Hymn not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
          >
            <Share2 size={22} color="#374151" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleFavoritePress}
          >
            <Heart 
              size={22} 
              color={isFavorite(hymn.id) ? "#e74c3c" : "#374151"} 
              fill={isFavorite(hymn.id) ? "#e74c3c" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.hymnNumber}>Hymn #{hymn.id}</Text>
          <Text style={styles.hymnTitle}>{hymn.title}</Text>
        </View>

        <View style={styles.lyricsContainer}>
          {formatLyrics(hymn.lyrics)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  hymnNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
    marginBottom: 8,
    fontFamily: 'Inter-SemiBold',
  },
  hymnTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 36,
    fontFamily: 'Inter-Bold',
  },
  lyricsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  verseContainer: {
    marginBottom: 24,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#374151',
    fontFamily: 'CrimsonText-Regular',
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