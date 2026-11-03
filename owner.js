const fmt = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
const $ = (id) => document.getElementById(id);
const state = { products: [], cart: [], categories: [], settings: {} };

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed.');
  return body;
}

function safe(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function toast(message) {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function applyTheme(theme) {
  if (!theme) return;
  document.documentElement.style.setProperty('--gold', theme.accent || '#f2c451');
  document.documentElement.style.setProperty('--accent', theme.accent || '#f2c451');
  document.documentElement.style.setProperty('--surface', theme.surface || '#141e32');
  document.documentElement.style.setProperty('--text', theme.text || '#f7f8fc');
}

function renderCategories() {
  const grid = $('category-grid');
  const filter = $('category-filter');
  if (grid) {
    grid.innerHTML = state.categories.map((category) => `
      <a class="category-card" href="#catalog">
        <div class="icon">${safe(category.icon || '🛍️')}</div>
        <h3>${safe(category.name)}</h3>
        <p>${safe(category.description || '')}</p>
      </a>
    `).join('');
  }

  if (filter) {
    filter.innerHTML = '<option value="All">All categories</option>' + state.categories.map((category) => `<option value="${safe(category.name)}">${safe(category.name)}</option>`).join('');
  }
}

function renderProducts() {
  const grid = $('product-grid');
  if (!grid) return;

  const query = ($('search')?.value || '').trim().toLowerCase();
  const category = $('category-filter')?.value || 'All';

  const filtered = state.products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const haystack = `${product.name || ''} ${product.description || ''} ${product.category || ''} ${(product.tags || []).join(' ')}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);
    return product.visible !== false && matchesCategory && matchesSearch;
  });

  grid.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <img src="${safe(product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80')}" alt="${safe(product.name)}" loading="lazy" />
      <div class="product-body">
        <span class="product-category">${safe(product.category)}</span>
        <h3>${safe(product.name)}</h3>
        <p>${safe(product.description || '')}</p>
        <div class="product-row">
          <strong>${fmt(product.price)}</strong>
          <button class="btn gold small" data-add="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>${product.stock < 1 ? 'Out of stock' : 'Add to cart'}</button>
        </div>
      </div>
    </article>
  `).join('') || '<p class="muted">No matching products found.</p>';
}

function updateCart() {
  const count = $('cart-count');
  if (count) count.textContent = state.cart.reduce((total, item) => total + item.quantity, 0);
}

async function checkout() {
  if (!state.cart.length) {
    toast('Your cart is empty.');
    return;
  }

  const name = prompt('Name for this order (optional):') || 'Guest';
  const phone = prompt('Phone number (optional):') || '';

  try {
    const order = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ customerName: name, phone, items: state.cart.map((item) => ({ id: item.id, quantity: item.quantity })) })
    });

    state.cart = [];
    updateCart();
    toast(`Order ${order.id} submitted. Payment is not collected online.`);
  } catch (error) {
    toast(error.message || 'Could not create order.');
  }
}

async function load() {
  try {
    const data = await api('/api/storefront');
    state.settings = data.settings || {};
    state.categories = data.categories || [];
    state.products = data.products || [];
    const activeTheme = (data.themes || []).find((theme) => Number(theme.active) === 1) || (data.themes || [])[0];
    applyTheme(activeTheme);

    if ($('store-name')) $('store-name').textContent = state.settings.storeName || 'Royal Mobile And Printing Store';
    if ($('store-name-footer')) $('store-name-footer').textContent = state.settings.storeName || 'Royal Mobile And Printing Store';
    if ($('store-tagline')) $('store-tagline').textContent = state.settings.storeTagline || 'Print • Create • Customize';
    if ($('store-address')) $('store-address').textContent = `${state.settings.address || 'Faisalabad, Punjab, Pakistan'} · ${state.settings.phone || '03040011041'}`;
    document.title = state.settings.storeName || 'Royal Mobile And Printing Store';

    renderCategories();
    renderProducts();
  } catch (error) {
    toast(`Store API unavailable: ${error.message}`);
  }
}

$('product-grid')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;

  const product = state.products.find((item) => item.id === Number(button.dataset.add));
  if (!product || product.stock < 1) return;

  const existing = state.cart.find((item) => item.id === product.id);
  if (existing) existing.quantity += 1;
  else state.cart.push({ ...product, quantity: 1 });

  updateCart();
  toast(`${product.name} added to cart.`);
});

$('cart-button')?.addEventListener('click', checkout);
$('search')?.addEventListener('input', renderProducts);
$('category-filter')?.addEventListener('change', renderProducts);

$('custom-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());

  try {
    await api('/api/requests', { method: 'POST', body: JSON.stringify(data) });
    form.reset();
    toast('Custom request submitted. The store will contact you.');
  } catch (error) {
    toast(error.message || 'Unable to submit request.');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  if ($('year')) $('year').textContent = new Date().getFullYear();
  load();
});

