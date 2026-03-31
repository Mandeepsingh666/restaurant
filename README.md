# PNK Surinamese Cuisine & Majnoon Café — Website

Static restaurant website for **PNK Surinamese Cuisine & Majnoon Café**, hosted on GitHub Pages.
The menu is powered by a **public Google Sheet** — no server or backend required.

---

## Quick Start

| File | Purpose |
|------|---------|
| `index.html` | Single-page app — all sections |
| `style.css`  | Dark theme, Suriname colors, responsive layout |
| `app.js`     | Fetches menu from Google Sheets, renders cards |
| `menu-data.csv` | Pre-populated menu data — import into Google Sheets |

---

## 1. Deploy to GitHub Pages

1. **Fork or clone** this repo to your GitHub account.
2. Go to your repo on GitHub → **Settings** → **Pages**.
3. Under *Source*, select **Deploy from a branch**.
4. Choose branch: `main` · folder: `/ (root)`.
5. Click **Save**.
6. Your site will be live at:
   `https://your-username.github.io/restaurant/`

> GitHub Pages can take 1–2 minutes to publish after each push.

---

## 2. Google Sheet Setup

### Step 1 — Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and click **Blank** to create a new spreadsheet.
2. Name it something like `PNK Menu`.

### Step 2 — Import the menu data

1. In your new sheet, go to **File → Import**.
2. Click **Upload** and select `menu-data.csv` from this repo.
3. Set *Import location* to **Replace current sheet**.
4. Set *Separator type* to **Comma**.
5. Click **Import data**.

Your sheet now has all 24 menu items pre-loaded with the correct column structure.

### Step 3 — Make the sheet public

1. Click **Share** (top-right).
2. Under *General access*, change from *Restricted* to **Anyone with the link**.
3. Set the role to **Viewer**.
4. Click **Done**.

> ⚠️ The sheet **must** be set to "Anyone with the link" for the website to read it.

### Step 4 — Get your Sheet ID

Your Google Sheet URL looks like this:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
                                        ↑─────────────── Sheet ID ──────────────────↑
```
Copy the long string between `/d/` and `/edit`.

### Step 5 — Connect the website

1. Open `app.js` in a text editor.
2. Find line 15:
   ```js
   const SHEET_ID = 'YOUR_SHEET_ID_HERE';
   ```
3. Replace `YOUR_SHEET_ID_HERE` with your actual Sheet ID:
   ```js
   const SHEET_ID = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms';
   ```
4. Save the file, commit, and push to GitHub.

---

## 3. Managing the Menu

### Update a price
1. Open your Google Sheet.
2. Find the item in column E (`price`) and change the value.
3. Refresh the website — changes appear immediately (no redeploy needed).

### Hide an item temporarily
1. Find the item in your sheet.
2. In column F (`available`), change `TRUE` to `FALSE`.
3. The item disappears from the website instantly.

### Add a new item
Add a new row with all columns filled in:

| Column | Header | Example |
|--------|--------|---------|
| A | `category` | `Suriname Menu` |
| B | `item_name` | `Roti Met Kip` |
| C | `local_name` | *(leave blank if same)* |
| D | `description` | `Flatbread with spiced chicken curry` |
| E | `price` | `$14.00` |
| F | `available` | `TRUE` |
| G | `image_url` | *(see below, or leave blank)* |
| H | `notes` | `New` *(or Spicy / Popular, or leave blank)* |

**Valid category values** (must match exactly):
- `Suriname Menu`
- `Finger Foods`
- `Dessert`
- `Drinks`
- `Weekend Special`

---

## 4. Adding Photos

### Step 1 — Upload to Google Drive
1. Go to [drive.google.com](https://drive.google.com).
2. Upload the food photo (JPG or PNG recommended, ideally 800×450 px or similar 16:9 ratio).

### Step 2 — Make it publicly accessible
1. Right-click the photo → **Share**.
2. Under *General access*, change to **Anyone with the link** → **Viewer**.
3. Click **Copy link**. The link will look like:
   `https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing`

### Step 3 — Convert to a direct image URL
Extract the **File ID** (the string between `/d/` and `/view`):
`1AbCdEfGhIjKlMnOpQrStUvWxYz`

Build the direct URL:
```
https://drive.google.com/uc?export=view&id=1AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Step 4 — Paste into the sheet
Paste that URL into column G (`image_url`) for the item.
The photo will appear on the website on the next page load.

> **Note:** If a photo fails to load, the website automatically shows a coloured placeholder with the item's first letter.

---

## 5. Updating Restaurant Info

All static text (address, hours, phone, social links) is in **`index.html`**.

| What to change | Where to find it in `index.html` |
|---------------|----------------------------------|
| Phone number | Search for `7187381058` |
| Address | Search for `Liberty Avenue` |
| Hours | Search for `12:00 PM` |
| Instagram handle | Search for `@majnoonny` |
| Facebook page URL | Search for `facebook.com` |
| Google Maps | Find the `<iframe>` inside `section#contact` and replace the `src` with the embed URL from Google Maps (Share → Embed a map) |

---

## 6. Google Sheet Column Reference

| Col | Header | Type | Description |
|-----|--------|------|-------------|
| A | `category` | Text | Section name — must match exactly one of the 5 valid values |
| B | `item_name` | Text | Item name shown bold on the card |
| C | `local_name` | Text | Dutch/Surinamese name if different *(optional)* |
| D | `description` | Text | English description shown in italics |
| E | `price` | Text | e.g. `$15.00` or `3/$10.00` |
| F | `available` | TRUE/FALSE | Set `FALSE` to hide the item from the website |
| G | `image_url` | URL | Direct Google Drive link *(optional)* |
| H | `notes` | Text | Badge label: `Popular`, `Spicy`, `New`, or custom *(optional)* |

---

## Tech Stack

- Pure HTML · CSS · Vanilla JavaScript
- Zero dependencies · No build step · GitHub Pages compatible
- Google Sheets as CMS via the public gviz JSON API
- Google Fonts: Playfair Display + Lato

---

## Contact

**PNK Surinamese Cuisine & Majnoon Café**
128-12 Liberty Avenue, Richmond Hill, NY 11419
📞 (718) 738-1058
📸 Instagram: [@majnoonny](https://instagram.com/majnoonny)
🕐 Open 7 days a week · 12:00 PM – 8:00 PM
🌙 All food is **100% Halal**
