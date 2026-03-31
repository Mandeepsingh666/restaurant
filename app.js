/* ═══════════════════════════════════════════════════════════
   PNK Surinamese Cuisine & Majnoon Café
   app.js — Menu loaded from menu.json + UI behaviour
   ═══════════════════════════════════════════════════════════ */

// Menu sections — displayed in this order
// The `key` must match the "category" value in menu.json
const SECTIONS = [
  { key: 'Suriname Menu',   label: 'Suriname Menu',          emoji: '🍜', color: '#377E3F' },
  { key: 'Finger Foods',    label: 'Gebakjes (Finger Foods)', emoji: '🥟', color: '#B40A2D' },
  { key: 'Dessert',         label: 'Nagerecht (Dessert)',     emoji: '🍮', color: '#c8940a' },
  { key: 'Drinks',          label: 'Drank (Drinks)',          emoji: '🥤', color: '#1a6b8a' },
  { key: 'Weekend Special', label: 'Weekend Special',         emoji: '⭐', color: '#6b2d8a' },
];

// ─────────────────────────────────────────────────────────────
// FETCH & RENDER MENU
// ─────────────────────────────────────────────────────────────
async function fetchMenu() {
  const loadingEl   = document.getElementById('menu-loading');
  const containerEl = document.getElementById('menu-container');
  const errorEl     = document.getElementById('menu-error');

  try {
    const res = await fetch('menu.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const allItems = await res.json();

    if (!Array.isArray(allItems) || allItems.length === 0) {
      throw new Error('menu.json is empty or invalid');
    }

    // Group by category
    const grouped = new Map();
    allItems.forEach(item => {
      const cat = (item.category || '').trim();
      if (!cat || !item.item_name) return;
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat).push(item);
    });

    // Render in defined section order
    let html = '';
    SECTIONS.forEach(section => {
      const items = grouped.get(section.key) || [];
      if (items.length > 0) html += renderSection(section, items);
    });

    if (!html) throw new Error('No menu items found');

    containerEl.innerHTML = html;
    loadingEl.style.display   = 'none';
    containerEl.style.display = 'block';

  } catch (err) {
    console.error('[PNK Menu] Failed to load menu:', err.message);
    loadingEl.style.display = 'none';
    errorEl.style.display   = 'block';
  }
}

// ─────────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────────

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

function renderItem(item, accentColor) {
  const firstLetter  = String(item.item_name).charAt(0).toUpperCase();
  const escapedColor = escapeAttr(accentColor);

  // Image or styled letter placeholder
  const imageHTML = item.image_url
    ? `<img
         src="${escapeAttr(item.image_url)}"
         alt="${escapeAttr(item.item_name)}"
         loading="lazy"
         onerror="this.parentElement.innerHTML='<div class=\\"img-placeholder\\" style=\\"background:${escapedColor}\\">${firstLetter}</div>'"
       >`
    : `<div class="img-placeholder" style="background:${escapedColor}">${firstLetter}</div>`;

  // English translation shown in italics under the Dutch name
  const englishHTML = item.english_name
    ? `<p class="item-english">(${escapeHtml(item.english_name)})</p>`
    : '';

  // Description
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
        ${englishHTML}
        ${descHTML}
        <div class="item-badges">
          ${notesHTML}
          <span class="badge badge-halal">Halal ✓</span>
        </div>
      </div>
    </div>`;
}

function getNoteBadgeClass(notes) {
  const n = notes.toLowerCase();
  if (n.includes('popular')) return 'badge-popular';
  if (n.includes('spicy'))   return 'badge-spicy';
  if (n.includes('new'))     return 'badge-new';
  return 'badge-note';
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

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

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section highlighting
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
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
  fetchMenu();
});
