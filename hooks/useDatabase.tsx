import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Hymn, HymnSearchResult } from '@/types/hymn';

interface DatabaseContextProps {
  db: SQLite.SQLiteDatabase | null;
  isLoading: boolean;
  error: string | null;
  searchHymns: (query: string) => Promise<HymnSearchResult[]>;
  getAllHymns: () => Promise<Hymn[]>;
  getHymnById: (id: number) => Promise<Hymn | null>;
}

const DatabaseContext = createContext<DatabaseContextProps | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<Props> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      const dbFileName = 'sda_hymns.db';
      const dbPath = `${FileSystem.documentDirectory}${dbFileName}`;
      const fileExists = await FileSystem.getInfoAsync(dbPath);

      if (!fileExists.exists) {
        console.log('Copying DB from assets...');
        const asset = Asset.fromModule(require('@/assets/db/sda_hymns.db'));
        await asset.downloadAsync();

        await FileSystem.copyAsync({
          from: asset.localUri!,
          to: dbPath,
        });
      }

      const database = await SQLite.openDatabaseAsync(dbFileName, {}, FileSystem.documentDirectory);
      setDb(database);
    } catch (err) {
      console.error('Database init error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize DB');
    } finally {
      setIsLoading(false);
    }
  };

  const searchHymns = async (query: string): Promise<HymnSearchResult[]> => {
    if (!db || !query.trim()) return [];

    try {
      const numericQuery = parseInt(query);
      let results: any[] = [];

      if (!isNaN(numericQuery)) {
        results = await db.getAllAsync(`SELECT * FROM hymns WHERE id = ? LIMIT 1`, [numericQuery]);
      }

      if (results.length === 0) {
        results = await db.getAllAsync(
          `SELECT * FROM hymns 
           WHERE title LIKE ? OR lyrics LIKE ? 
           ORDER BY 
             CASE WHEN title LIKE ? THEN 1 ELSE 2 END,
             id ASC
           LIMIT 20`,
          [`%${query}%`, `%${query}%`, `%${query}%`]
        );
      }

      return results.map(hymn => ({
        ...hymn,
        snippet: hymn.lyrics.substring(0, 100) + '...',
      }));
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  };

  const getAllHymns = async (): Promise<Hymn[]> => {
    if (!db) return [];
    try {
      return await db.getAllAsync(`SELECT * FROM hymns ORDER BY id ASC`) as Hymn[];
    } catch (err) {
      console.error('Get all hymns error:', err);
      return [];
    }
  };

  const getHymnById = async (id: number): Promise<Hymn | null> => {
    if (!db) return null;
    try {
      const result = await db.getFirstAsync(`SELECT * FROM hymns WHERE id = ?`, [id]);
      return result as Hymn || null;
    } catch (err) {
      console.error('Get hymn by ID error:', err);
      return null;
    }
  };

  return (
    <DatabaseContext.Provider value={{ db, isLoading, error, searchHymns, getAllHymns, getHymnById }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextProps => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
