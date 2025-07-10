#!/bin/bash

DB_FILE="sda_hymns.db"

echo "🔄 Resetting SQLite DB: $DB_FILE"

# Delete the database file if it exists
if [ -f "$DB_FILE" ]; then
    echo "🗑️ Deleting old $DB_FILE..."
    rm "$DB_FILE"
else
    echo "ℹ️ No existing $DB_FILE found."
fi

# Recreate the database using the schema
echo "📐 Applying schema..."
sqlite3 "$DB_FILE" < hymnsSchema.sql

echo "✅ Done: $DB_FILE has been reset using hymnsSchema.sql"
