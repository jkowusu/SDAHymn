CREATE TABLE IF NOT EXISTS hymns (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    url TEXT NOT NULL,
    language TEXT DEFAULT 'English'
);
