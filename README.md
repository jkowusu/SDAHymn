# SDA Hymn Book App

This is a React Native mobile app built with Expo that allows users to browse, search, and favorite hymns from the SDA Hymnal.

---

## Database Setup

The app uses a local SQLite database (`sda_hymns.db`) that contains the hymn data (title, lyrics, language, and URL). You need to generate this database before running the app.

### Step-by-step Setup

1. **Create and activate virtual environment:**

```bash
python3 -m venv venv
source venv/bin/activate
```
If pip is not recognized, try:
```bash
python -m ensurepip --upgrade
```
inside the venv.

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Scrape initial song metadata:**

`scraping.py` uses Selenium to scrape the SDA Hymnal site and generates a JSON file with all hymn titles and URLs.

```bash
python scraping.py
```
Make sure you have ChromeDriver installed and in your PATH.

4. **Build the SQLite database:**

`db.py` uses the URLs from scraping.py to scrape each hymn’s lyrics and insert them into the `sda_hymns.db` file.

```bash
python db.py
```

5. **Reset the database if something breaks:**

```bash
./resetdb.sh
```
Make sure `resetdb.sh` is executable:
```bash
chmod +x resetdb.sh
```

## Running the App

Make sure Node.js and Expo CLI are installed.

Start the development server:

```bash
npx expo start
```

This will launch Expo DevTools in your browser. You can scan the QR code with the Expo Go app or run on iOS/Android simulators.

## Project Structure

- `assets/db/sda_hymns.db` — SQLite database used in the app.
- `scraping.py` — Scrapes all hymn URLs and titles.
- `db.py` — Extracts lyrics for each hymn and builds the final DB.
- `resetdb.sh` — Deletes the old database and reruns the pipeline.
- `app/` — Main application logic and screens.

## Notes

- Hymn data is cached and loaded locally from SQLite for fast access.
- Favorites are stored using AsyncStorage for persistence.
- On first launch, the database is copied from the assets folder to the local file system.

Enjoy building the SDA Hymnal experience!

