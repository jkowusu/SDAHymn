import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { Hymn, HymnSearchResult } from '@/types/hymn';

export function useDatabase() {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      const database = await SQLite.openDatabaseAsync('sda_hymns.db');
      setDb(database);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
      setIsLoading(false);
    }
  };

  const searchHymns = async (query: string): Promise<HymnSearchResult[]> => {
    if (!db || !query.trim()) return [];

    try {
      const numericQuery = parseInt(query);
      let results: any[] = [];

      if (!isNaN(numericQuery)) {
        // Search by hymn number first
        results = await db.getAllAsync(
          `SELECT * FROM hymns WHERE id = ? LIMIT 1`,
          [numericQuery]
        );
      }

      if (results.length === 0) {
        // Search by title and lyrics
        results = await db.getAllAsync(
          `SELECT * FROM hymns 
           WHERE title LIKE ? OR lyrics LIKE ? 
           ORDER BY 
             CASE 
               WHEN title LIKE ? THEN 1 
               ELSE 2 
             END,
             id ASC
           LIMIT 20`,
          [`%${query}%`, `%${query}%`, `%${query}%`]
        );
      }

      return results.map(hymn => ({
        ...hymn,
        snippet: hymn.lyrics.substring(0, 100) + '...'
      }));
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  };

  const getAllHymns = async (): Promise<Hymn[]> => {
    if (!db) return [];

    try {
      const results = await db.getAllAsync(
        `SELECT * FROM hymns ORDER BY id ASC`
      );
      return results as Hymn[];
    } catch (err) {
      console.error('Get all hymns error:', err);
      return [];
    }
  };

  const getHymnById = async (id: number): Promise<Hymn | null> => {
    if (!db) return null;

    try {
      const result = await db.getFirstAsync(
        `SELECT * FROM hymns WHERE id = ?`,
        [id]
      );
      return result as Hymn || null;
    } catch (err) {
      console.error('Get hymn by ID error:', err);
      return null;
    }
  };

  return {
    db,
    isLoading,
    error,
    searchHymns,
    getAllHymns,
    getHymnById
  };
}