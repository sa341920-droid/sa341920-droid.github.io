const fmt = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;
const $ = (id) => document.getElementById(id);

const state = {
  store: null,
  products: [],
  cart: [],
  categories: [],
  theme: null
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function updateCartCount() {
  $('cart-count').textContent = state.cart.length;
}

function applyTheme(theme) {
  if (!theme) return;
  document.documentElement.style.setProperty('--accent', theme.accent || '#f4c95d');
  document.documentElement.style.setProperty('--secondary', theme.secondary || '#1f2937');
  document.documentElement.style.setProperty('--surface', theme.surface || '#fff7ed');
  document.documentElement.style.setProperty('--text', theme.text || '#0f172a');
}

function renderCategories() {
  const grid = $('category-grid');
  if (!grid) return;
  grid.innerHTML = state.categories.map((category) => `
    <article class="category-card">
      <div class="icon">${category.icon || '🛍️'}</div>
      <h3>${category.name}</h3>
      <p>${category.description || 'Curated items for your business needs.'}</p>
    </article>
  `).join('');

  const filter = $('category-filter');
  if (!filter) return;
  filter.innerHTML = ['<option value="All">All categories</option>']
    .concat(state.categories.map((category) => `<option value="${category.name}">${category.name}</option>`))
    .join('');
}

function renderProducts() {
  const grid = $('product-grid');
  if (!grid) return;

  const query = ($('search')?.value || '').trim().toLowerCase();
  const category = $('category-filter')?.value || 'All';

  const filtered = state.products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const searchText = [product.name, product.description, product.category, ...(product.tags || [])].join(' ').toLowerCase();
    const matchesSearch = !query || searchText.includes(query);
    return matchesCategory && matchesSearch;
  });

  grid.innerHTML = filtered.map((product) => `
    <article class="product-card">
      <img src="${product.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'}" alt="${product.name}" />
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <p>${product.description || 'Product description coming soon.'}</p>
        <div class="product-row">
          <strong>${fmt(product.price)}</strong>
          <button class="btn gold small" data-add="${product.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('') || '<p class="muted">No products found for the selected filters.</p>';
}

function showToast(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

function bindCatalogActions() {
  $('product-grid')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (!button) return;
    const productId = Number(button.dataset.add);
    const product = state.products.find((entry) => entry.id === productId);
    if (!product) return;
    state.cart.push(product);
    updateCartCount();
    showToast(`${product.name} added to cart.`);
  });

  $('cart-button')?.addEventListener('click', () => {
    if (!state.cart.length) {
      showToast('Your cart is empty.');
      return;
    }
    const total = state.cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const text = state.cart.map((item) => `${item.name} — ${fmt(item.price)}`).join('\n');
    alert(`DEMO CART\n\n${text}\n\nTotal: ${fmt(total)}`);
  });

  $('search')?.addEventListener('input', renderProducts);
  $('category-filter')?.addEventListener('change', renderProducts);
}

async function handleCustomRequest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const files = formData.getAll('images');
  const hasFiles = files.some((file) => file && file.name);

  if (hasFiles && files.length > 20) {
    showToast('Please select no more than 20 images.');
    return;
  }

  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      body: formData
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to submit request.');

    form.reset();
    showToast('Custom request submitted successfully.');
  } catch (error) {
    showToast(error.message || 'Unable to submit request.');
  }
}

async function loadStorefront() {
  try {
    const payload = await fetchJson('/api/storefront');
    state.store = payload.settings || {};
    state.categories = payload.categories || [];
    state.products = payload.products || [];
    applyTheme(payload.activeTheme || payload.themes?.find((theme) => Number(theme.active) === 1) || null);

    document.title = `${state.store.storeName || 'Royal Mobile And Printing Store'} — Storefront`;
    $('store-name') && ($('store-name').textContent = state.store.storeName || 'Royal Mobile And Printing Store');
    $('store-name-footer') && ($('store-name-footer').textContent = state.store.storeName || 'Royal Mobile And Printing Store');
    $('store-tagline') && ($('store-tagline').textContent = state.store.storeTagline || 'Print • Create • Customize');
    $('store-address') && ($('store-address').textContent = `${state.store.address || 'Faisalabad, Punjab, Pakistan'} · ${state.store.phone || '03040011041'}`);
    document.getElementById('year').textContent = new Date().getFullYear();

    renderCategories();
    renderProducts();
    bindCatalogActions();

    const requestForm = $('custom-form');
    if (requestForm) {
      requestForm.addEventListener('submit', handleCustomRequest);
    }
  } catch (error) {
    console.error(error);
    showToast('Store data is unavailable right now.');
  }
}

window.addEventListener('DOMContentLoaded', loadStorefront);
