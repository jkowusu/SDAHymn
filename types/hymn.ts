export interface Hymn {
  id: number;
  title: string;
  lyrics: string;
  url: string;
  language: string;
}

export interface HymnSearchResult extends Hymn {
  snippet?: string;
}