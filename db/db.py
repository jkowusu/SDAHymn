import sqlite3
import json
import requests
from bs4 import BeautifulSoup
import time




# Load master list of hymns
with open("sda_hymns_master.json", "r", encoding="utf-8") as f:
    master_list = json.load(f)

# Connect to SQLite DB
conn = sqlite3.connect("sda_hymns.db")
c = conn.cursor()

def scrape_lyrics(url):
    """Scrape lyrics from a hymn page, handling <table><p><br> structure."""
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, "html.parser")

        table = soup.find("table")
        if not table:
            raise Exception("No <table> found on page")

        lyrics = []

        for p in table.find_all("p"):
            # Convert <br> tags to newlines
            for br in p.find_all("br"):
                br.replace_with("\n")
            text = p.get_text(separator="\n", strip=True)
            if text:
                lyrics.append(text)

        return "\n\n".join(lyrics)

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

# Main scrape & insert loop
for hymn in master_list:
    hymn_id = hymn["id"]
    title = hymn["title"]
    url = hymn["url"]

    # Skip if already in DB
    c.execute("SELECT 1 FROM hymns WHERE id = ?", (hymn_id,))
    if c.fetchone():
        print(f"Hymn {hymn_id} already exists. Skipping.")
        continue

    lyrics = scrape_lyrics(url)

    if lyrics:
        c.execute('''
            INSERT INTO hymns (id, title, lyrics, url, language)
            VALUES (?, ?, ?, ?, ?)
        ''', (hymn_id, title, lyrics, url, "English"))

        print(f"Inserted Hymn {hymn_id}: {title}")
        time.sleep(0.5)
    else:
        print(f" No lyrics found for Hymn {hymn_id}: {title}")

# Done
conn.commit()
conn.close()
print("All hymns processed and saved.")
