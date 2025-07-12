from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from bs4 import BeautifulSoup
import json
import time

# Setup
options = Options()
#options.add_argument("--headless")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

driver.get("https://sdahymnals.com/Hymnal/")
time.sleep(3)

# Set dropdown to show 100 entries per page
select = Select(driver.find_element(By.ID, "dt-length-0"))
select.select_by_value("100")
time.sleep(2)  # wait for table to update

hymns = []
page_num = 1

while page_num < 8:
    print(f"📄 Scraping page {page_num}...")

    # Get current page HTML and parse
    soup = BeautifulSoup(driver.page_source, "html.parser")
    table = soup.find("table")
    if table:
        rows = table.find("tbody").find_all("tr")
        for row in rows:
            cols = row.find_all("td")
            if len(cols) >= 2:
                hymn_number = cols[0].text.strip()
                hymn_link = cols[1].find("a")
                hymn_title = hymn_link.text.strip()
                hymn_url = hymn_link["href"]

                hymns.append({
                    "id": int(hymn_number),
                    "title": hymn_title,
                    "url": hymn_url
                })

    # Try to click the "Next" button
    try:
        next_btn = driver.find_element(By.CSS_SELECTOR, "button.dt-paging-button.next")
        if not next_btn.is_enabled():
            break  # stop loop when button is disabled
        next_btn.click()
        time.sleep(2)
        page_num += 1
    except NoSuchElementException:
        print("❌ Next button not found")
        break

driver.quit()

# Save result
with open("sda_hymns_master.json", "w", encoding="utf-8") as f:
    json.dump(hymns, f, indent=2, ensure_ascii=False)

print(f"✅ Scraped {len(hymns)} hymns across {page_num} pages.")
