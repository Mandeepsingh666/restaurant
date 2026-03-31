/* ═══════════════════════════════════════════════════════════
   PNK Surinamese Cuisine & Majnoon Café
   app.js — Menu fetching from Google Sheets + UI behaviour
   ═══════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// Replace YOUR_SHEET_ID_HERE with the ID from your Google Sheet URL.
// The ID is the long string between /spreadsheets/d/ and /edit
// Example URL: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
//                                                     ↑ this part ↑
// ─────────────────────────────────────────────────────────────
const SHEET_ID = '1l4rIOjtInNmybOV8VdyWovTTgUP2s7XW0XUb--afCfo';

const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// Menu sections — displayed in this order
// The `key` must exactly match the value in column A of your sheet
const SECTIONS = [
  { key: 'Suriname Menu',   label: 'Suriname Menu',          emoji: '🍜', color: '#377E3F' },
  { key: 'Finger Foods',    label: 'Gebakjes (Finger Foods)', emoji: '🥟', color: '#B40A2D' },
  { key: 'Dessert',         label: 'Nagerecht (Dessert)',     emoji: '🍮', color: '#c8940a' },
  { key: 'Drinks',          label: 'Drank (Drinks)',          emoji: '🥤', color: '#1a6b8a' },
  { key: 'Weekend Special', label: 'Weekend Special',         emoji: '⭐', color: '#6b2d8a' },
];

// ─────────────────────────────────────────────────────────────
// FETCH & PARSE
// ─────────────────────────────────────────────────────────────
async function fetchMenu() {
  const loadingEl  = document.getElementById('menu-loading');
  const containerEl = document.getElementById('menu-container');
  const errorEl    = document.getElementById('menu-error');

  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error(`Network error: HTTP ${res.status}`);

    const text = await res.text();

    // The gviz API wraps the response in a JSONP callback:
    //   /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    // Strip the wrapper to get plain JSON.
    const jsonStr = text
      .replace(/^[^(]*\(/, '')   // remove everything up to first (
      .replace(/\);?\s*$/, '');   // remove trailing );

    const data = JSON.parse(jsonStr);
    const rows = (data && data.table && data.table.rows) || [];

    if (rows.length === 0) throw new Error('Sheet appears to be empty');

    // Map each row → item object using column indices A-H
    const allItems = rows
      .map(row => ({
        category:    getCellValue(row, 0),  // A
        item_name:   getCellValue(row, 1),  // B
        local_name:  getCellValue(row, 2),  // C
        description: getCellValue(row, 3),  // D
        price:       getCellValue(row, 4),  // E
        available:   getCellValue(row, 5),  // F
        image_url:   getCellValue(row, 6),  // G
        notes:       getCellValue(row, 7),  // H
      }))
      .filter(item => {
        // Skip rows without a name or category
        if (!item.category || !item.item_name) return false;
        // Hide if available column is explicitly FALSE
        const av = String(item.available).trim().toUpperCase();
        return av !== 'FALSE';
      });

    // Group items by category
    const grouped = new Map();
    allItems.forEach(item => {
      const cat = item.category.trim();
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(item);
    });

    // Render sections in the defined order
    let html = '';
    SECTIONS.forEach(section => {
      const items = grouped.get(section.key) || [];
      if (items.length > 0) {
        html += renderSection(section, items);
      }
    });

    if (!html) throw new Error('No visible menu items found');

    containerEl.innerHTML = html;
    loadingEl.style.display  = 'none';
    containerEl.style.display = 'block';

  } catch (err) {
    console.error('[PNK Menu] Failed to load menu:', err.message);
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

/** Safely read a cell value, returning '' for null/undefined */
function getCellValue(row, colIndex) {
  const cell = row.c && row.c[colIndex];
  if (!cell || cell.v === null || cell.v === undefined) return '';
  return cell.v;
}

// ─────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────

/** Render one section block (heading + grid of cards) */
function renderSection(section, items) {
  const sectionId = section.key.toLowerCase().replace(/\s+/g, '-');
  return `
    <div class="menu-section-block" id="section-${sectionId}">
      <div class="menu-section-header">
        <span class="menu-section-emoji">${section.emoji}</span>
        <h2>${escapeHtml(section.label)}</h2>
      </div>
      <div class="menu-grid">
        ${items.map(item => renderItem(item, section.color)).join('')}
      </div>
    </div>`;
}

/** Render one menu card */
function renderItem(item, accentColor) {
  const firstLetter = String(item.item_name).charAt(0).toUpperCase();
  const escapedColor = escapeAttr(accentColor);

  // Image or styled placeholder
  const imageHTML = item.image_url
    ? `<img
         src="${escapeAttr(item.image_url)}"
         alt="${escapeAttr(item.item_name)}"
         loading="lazy"
         onerror="this.parentElement.innerHTML='<div class=\\"img-placeholder\\" style=\\"background:${escapedColor}\\">${firstLetter}</div>'"
       >`
    : `<div class="img-placeholder" style="background:${escapedColor}">${firstLetter}</div>`;

  // Description (italicised)
  const descHTML = item.description
    ? `<p class="item-description">${escapeHtml(item.description)}</p>`
    : '';

  // Notes badge
  const notesHTML = item.notes
    ? `<span class="badge ${getNoteBadgeClass(item.notes)}">${escapeHtml(item.notes)}</span>`
    : '';

  return `
    <div class="menu-card">
      <div class="card-image">${imageHTML}</div>
      <div class="card-body">
        <div class="card-top-row">
          <span class="item-name">${escapeHtml(item.item_name)}</span>
          <span class="item-price">${escapeHtml(item.price)}</span>
        </div>
        ${descHTML}
        <div class="item-badges">
          ${notesHTML}
          <span class="badge badge-halal">Halal ✓</span>
        </div>
      </div>
    </div>`;
}

/** Map a notes value to a CSS badge class */
function getNoteBadgeClass(notes) {
  const n = notes.toLowerCase();
  if (n.includes('popular')) return 'badge-popular';
  if (n.includes('spicy'))   return 'badge-spicy';
  if (n.includes('new'))     return 'badge-new';
  return 'badge-note';
}

/** Escape text for safe insertion as HTML content */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Escape text for safe use inside an HTML attribute value */
function escapeAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─────────────────────────────────────────────────────────────
// NAVIGATION — active state & mobile toggle
// ─────────────────────────────────────────────────────────────
function initNav() {
  const navToggle = document.getElementById('nav-toggle');
  const mainNav   = document.getElementById('main-nav');
  const navLinks  = document.querySelectorAll('.nav-link');

  // Mobile toggle
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section highlighting via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      { threshold: 0.35, rootMargin: '-64px 0px 0px 0px' }
    );
    sections.forEach(s => observer.observe(s));
  }
}

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();

  if (SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    // Sheet not yet configured — show friendly setup message
    const loadingEl = document.getElementById('menu-loading');
    const errorEl   = document.getElementById('menu-error');
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
    errorEl.innerHTML = `
      <div class="error-icon">📋</div>
      <h3>Menu Setup Required</h3>
      <p>
        Open <code>app.js</code> and replace <code>YOUR_SHEET_ID_HERE</code>
        with your Google Sheet ID.
      </p>
      <p>See <a href="README.md">README.md</a> for step-by-step instructions.</p>`;
    return;
  }

  fetchMenu();
});
