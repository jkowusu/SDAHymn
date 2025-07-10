import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Hymn } from '@/types/hymn';

interface HymnCardProps {
  hymn: Hymn;
  onPress: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  showSnippet?: boolean;
}

export function HymnCard({ 
  hymn, 
  onPress, 
  onFavoritePress, 
  isFavorite = false, 
  showSnippet = false 
}: HymnCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.number}>#{hymn.id}</Text>
          {onFavoritePress && (
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={onFavoritePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart 
                size={20} 
                color={isFavorite ? "#e74c3c" : "#ccc"} 
                fill={isFavorite ? "#e74c3c" : "transparent"}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {hymn.title}
        </Text>
        {showSnippet && (
          <Text style={styles.snippet} numberOfLines={2}>
            {hymn.lyrics.substring(0, 80)}...
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  number: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
    fontFamily: 'Inter-SemiBold',
  },
  favoriteButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 22,
    fontFamily: 'Inter-SemiBold',
  },
  snippet: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
  },
});