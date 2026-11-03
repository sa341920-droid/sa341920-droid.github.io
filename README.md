const state = {
  products: [],
  requests: [],
  settings: {},
  themes: [],
  activeTheme: null
};

const $ = (id) => document.getElementById(id);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed');
  return payload;
}

function renderStats() {
  $('admin-product-count').textContent = state.products.length;
  $('admin-request-count').textContent = state.requests.length;
  $('admin-theme-name').textContent = state.activeTheme?.name || 'Royal Gold';
}

function renderSettingsForm() {
  const form = $('settings-form');
  if (!form) return;
  Object.entries(state.settings).forEach(([key, value]) => {
    const input = form.elements.namedItem(key);
    if (input) {
      input.value = value ?? '';
    }
  });
}

function renderThemeSelector() {
  const select = $('theme-select');
  if (!select) return;
  select.innerHTML = state.themes.map((theme) => `<option value="${theme.id}">${theme.name}</option>`).join('');
  if (state.activeTheme) {
    select.value = String(state.activeTheme.id);
  }

  const preview = $('theme-preview');
  if (!preview) return;
  const theme = state.activeTheme || state.themes[0];
  preview.innerHTML = `
    <div class="theme-chip" style="background:${theme.accent}; color:${theme.secondary};">${theme.name}</div>
    <div class="theme-sample" style="background:${theme.surface}; color:${theme.text}; border:1px solid ${theme.accent};">
      <span>Sample header</span>
      <button style="background:${theme.accent}; color:${theme.secondary};">Action</button>
    </div>
  `;
}

function renderProducts() {
  const list = $('admin-products');
  if (!list) return;
  list.innerHTML = state.products.map((product) => `
    <div class="admin-row">
      <div>
        <strong>${product.name}</strong>
        <small>${product.category} · stock ${product.stock}</small>
      </div>
      <div class="row-actions">
        <button class="btn small" data-edit="${product.id}" type="button">Edit</button>
        <button class="btn small danger" data-delete="${product.id}" type="button">Delete</button>
      </div>
    </div>
  `).join('') || '<p class="muted">No products yet.</p>';
}

function renderRequests() {
  const list = $('admin-requests');
  if (!list) return;
  list.innerHTML = state.requests.map((request) => `
    <div class="request-card">
      <div class="request-head">
        <div>
          <strong>${request.customer_name || 'Customer'}</strong>
          <small>${request.product_name || 'Custom request'} · ${request.status || 'Submitted'}</small>
        </div>
        <span class="badge">${request.status || 'Submitted'}</span>
      </div>
      <p>${request.description || 'No description provided.'}</p>
      <small>${request.phone || ''}</small>
    </div>
  `).join('') || '<p class="muted">No custom requests yet.</p>';
}

async function loadDashboard() {
  try {
    const storeData = await fetchJson('/api/storefront');
    const settings = await fetchJson('/api/owner/settings');
    const products = await fetchJson('/api/products');
    const requests = await fetchJson('/api/requests');
    const themes = await fetchJson('/api/themes');

    state.products = products;
    state.requests = requests;
    state.settings = settings;
    state.themes = themes;
    state.activeTheme = themes.find((theme) => Number(theme.active) === 1) || themes[0];

    renderStats();
    renderSettingsForm();
    renderThemeSelector();
    renderProducts();
    renderRequests();
  } catch (error) {
    console.error(error);
  }
}

$('settings-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const settings = await fetchJson('/api/owner/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    state.settings = settings;
    renderSettingsForm();
    alert('Settings saved successfully.');
  } catch (error) {
    alert(error.message || 'Settings could not be saved.');
  }
});

$('theme-select')?.addEventListener('change', async (event) => {
  const selectedId = Number(event.target.value);
  try {
    const response = await fetch(`/api/themes/${selectedId}/activate`, { method: 'POST' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Theme update failed.');
    state.activeTheme = payload.activeTheme;
    renderStats();
    renderThemeSelector();
  } catch (error) {
    console.error(error);
  }
});

$('product-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = Object.fromEntries(new FormData(form).entries());

  const body = {
    name: formData.name,
    category: formData.category,
    sku: formData.sku || `RMS-${Date.now()}`,
    description: formData.description,
    price: Number(formData.price || 0),
    wholesalePrice: Number(formData.wholesalePrice || 0),
    cost: Number(formData.cost || 0),
    stock: Number(formData.stock || 0),
    image: formData.image,
    tags: (formData.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
  };

  try {
    const product = await fetchJson('/api/products', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    state.products.unshift(product);
    renderProducts();
    renderStats();
    form.reset();
  } catch (error) {
    alert(error.message || 'Product could not be created.');
  }
});

$('admin-products')?.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete]');
  const editButton = event.target.closest('[data-edit]');

  if (deleteButton) {
    const productId = Number(deleteButton.dataset.delete);
    try {
      const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Delete failed');
      state.products = state.products.filter((product) => product.id !== productId);
      renderProducts();
      renderStats();
    } catch (error) {
      alert(error.message);
    }
  }

  if (editButton) {
    const productId = Number(editButton.dataset.edit);
    const product = state.products.find((entry) => entry.id === productId);
    if (!product) return;
    const form = $('product-form');
    form.elements.name.value = product.name;
    form.elements.category.value = product.category;
    form.elements.sku.value = product.sku || '';
    form.elements.price.value = product.price;
    form.elements.wholesalePrice.value = product.wholesale_price || '';
    form.elements.cost.value = product.cost || '';
    form.elements.stock.value = product.stock;
    form.elements.image.value = product.image || '';
    form.elements.tags.value = (product.tags || []).join(',');
    form.elements.description.value = product.description || '';
    form.elements.id.value = product.id;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.textContent = 'Update product';
    submitButton.dataset.mode = 'update';
    submitButton.dataset.id = String(product.id);
  }
});

$('product-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const productId = form.elements.id.value;
  const formData = Object.fromEntries(new FormData(form).entries());

  const payload = {
    name: formData.name,
    category: formData.category,
    sku: formData.sku || `RMS-${Date.now()}`,
    description: formData.description,
    price: Number(formData.price || 0),
    wholesalePrice: Number(formData.wholesalePrice || 0),
    cost: Number(formData.cost || 0),
    stock: Number(formData.stock || 0),
    image: formData.image,
    tags: (formData.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)
  };

  try {
    if (productId) {
      const updated = await fetchJson(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      state.products = state.products.map((product) => product.id === productId ? updated : product);
      form.reset();
      const button = form.querySelector('button[type="submit"]');
      button.textContent = 'Add product';
      button.dataset.mode = 'create';
      form.elements.id.value = '';
    } else {
      const created = await fetchJson('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      state.products.unshift(created);
      form.reset();
    }

    renderProducts();
    renderStats();
  } catch (error) {
    alert(error.message || 'Product action failed.');
  }
});

$('export-requests')?.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state.requests, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'royal-store-custom-requests.json';
  anchor.click();
  URL.revokeObjectURL(url);
});

window.addEventListener('DOMContentLoaded', loadDashboard);
