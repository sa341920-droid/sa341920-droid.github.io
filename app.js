const express = require('express');
const path = require('node:path');
const { all, get, run, seedDefaults } = require('./db');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname, { extensions: ['html'] }));

const number = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const safeJSONParse = (input, fallback = []) => {
  if (!input) return fallback;
  try {
    return JSON.parse(input);
  } catch {
    return fallback;
  }
};

const settingsObject = async () => Object.fromEntries(
  (await all('SELECT key,value FROM settings')).map((row) => [row.key, row.value])
);

const productsObject = async () =>
  (await all('SELECT * FROM products ORDER BY featured DESC, id DESC')).map((product) => ({
    ...product,
    tags: product.tags ? String(product.tags).split(',').map((tag) => tag.trim()).filter(Boolean) : [],
    visible: !!product.visible,
    featured: !!product.featured
  }));

app.get('/api/health', async (_req, res) => {
  try {
    await get('SELECT 1');
    res.json({ status: 'ok', database: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});

app.get('/api/storefront', async (_req, res) => {
  try {
    const settings = await settingsObject();
    const categories = await all('SELECT * FROM categories ORDER BY id');
    const products = await productsObject();
    const themes = await all('SELECT * FROM themes ORDER BY id');
    res.json({ settings, categories, products, themes });
  } catch (error) {
    res.status(500).json({ error: 'Store data unavailable.' });
  }
});

app.get('/api/products', async (_req, res) => {
  res.json(await productsObject());
});

app.post('/api/products', async (req, res) => {
  const payload = req.body || {};
  const name = String(payload.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Product name is required.' });

  const price = number(payload.price, 0);
  const stock = number(payload.stock, 0);
  const wholesalePrice = number(payload.wholesalePrice, price);
  const cost = number(payload.cost, 0);

  if (price < 0 || stock < 0) {
    return res.status(400).json({ error: 'Price and stock must be zero or greater.' });
  }

  try {
    const result = await run(
      'INSERT INTO products(name,category,sku,description,price,wholesale_price,cost,stock,tags,image,featured,visible,variant) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        name,
        String(payload.category || 'General'),
        String(payload.sku || `RMS-${Date.now()}`),
        String(payload.description || ''),
        price,
        wholesalePrice,
        cost,
        stock,
        Array.isArray(payload.tags) ? payload.tags.join(',') : String(payload.tags || ''),
        String(payload.image || ''),
        payload.featured ? 1 : 0,
        payload.visible === false ? 0 : 1,
        String(payload.variant || '')
      ]
    );
    const product = await get('SELECT * FROM products WHERE id=?', [result.lastID]);
    res.status(201).json({ ...product, tags: product.tags ? product.tags.split(',') : [], visible: !!product.visible, featured: !!product.featured });
  } catch (error) {
    const status = error.code === 'SQLITE_CONSTRAINT' ? 409 : 500;
    res.status(status).json({ error: error.code === 'SQLITE_CONSTRAINT' ? 'SKU already exists.' : 'Could not save product.' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const id = number(req.params.id, -1);
  const existing = await get('SELECT * FROM products WHERE id=?', [id]);
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  const payload = req.body || {};
  try {
    await run(
      'UPDATE products SET name=?,category=?,sku=?,description=?,price=?,wholesale_price=?,cost=?,stock=?,tags=?,image=?,featured=?,visible=?,variant=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [
        payload.name ?? existing.name,
        payload.category ?? existing.category,
        payload.sku ?? existing.sku,
        payload.description ?? existing.description,
        number(payload.price, existing.price),
        number(payload.wholesalePrice, existing.wholesale_price),
        number(payload.cost, existing.cost),
        number(payload.stock, existing.stock),
        Array.isArray(payload.tags) ? payload.tags.join(',') : (payload.tags ?? existing.tags ?? ''),
        payload.image ?? existing.image,
        payload.featured === undefined ? existing.featured : (payload.featured ? 1 : 0),
        payload.visible === undefined ? existing.visible : (payload.visible ? 1 : 0),
        payload.variant ?? existing.variant,
        id
      ]
    );
    const updated = await get('SELECT * FROM products WHERE id=?', [id]);
    res.json({ ...updated, tags: updated.tags ? updated.tags.split(',') : [], visible: !!updated.visible, featured: !!updated.featured });
  } catch (error) {
    res.status(400).json({ error: 'Could not update product; check the SKU and values.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const id = number(req.params.id, -1);
  const result = await run('DELETE FROM products WHERE id=?', [id]);
  if (result.changes) {
    res.json({ success: true });
    return;
  }
  res.status(404).json({ error: 'Product not found.' });
});

app.get('/api/categories', async (_req, res) => {
  res.json(await all('SELECT * FROM categories ORDER BY id'));
});

app.get('/api/owner/settings', async (_req, res) => {
  res.json(await settingsObject());
});

app.put('/api/owner/settings', async (req, res) => {
  const updates = req.body || {};
  const allowed = new Set(['storeName', 'storeTagline', 'phone', 'whatsapp', 'email', 'address', 'businessHours', 'currency', 'taxRate', 'coverTitle']);

  for (const [key, value] of Object.entries(updates)) {
    if (!allowed.has(key)) {
      return res.status(400).json({ error: `Unsupported setting: ${key}` });
    }
    await run('INSERT INTO settings(key,value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, String(value).slice(0, 1000)]);
  }

  res.json(await settingsObject());
});

app.get('/api/themes', async (_req, res) => {
  res.json(await all('SELECT * FROM themes ORDER BY id'));
});

app.post('/api/themes/:id/activate', async (req, res) => {
  const id = number(req.params.id, -1);
  const theme = await get('SELECT * FROM themes WHERE id=?', [id]);
  if (!theme) return res.status(404).json({ error: 'Theme not found.' });

  await run('UPDATE themes SET active = 0');
  await run('UPDATE themes SET active = 1 WHERE id=?', [id]);
  await run('INSERT INTO settings(key,value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', ['themeId', String(id)]);
  res.json({ activeTheme: { ...theme, active: 1 } });
});

app.get('/api/requests', async (_req, res) => {
  res.json(await all('SELECT * FROM custom_requests ORDER BY id DESC'));
});

app.post('/api/requests', async (req, res) => {
  const payload = req.body || {};
  const required = ['customerName', 'phone', 'productName', 'description'];
  for (const key of required) {
    if (!String(payload[key] || '').trim()) {
      return res.status(400).json({ error: `${key} is required.` });
    }
  }

  const quantity = number(payload.quantity, 1);
  if (quantity < 1 || quantity > 100000) {
    return res.status(400).json({ error: 'Quantity must be between 1 and 100000.' });
  }

  const result = await run(
    'INSERT INTO custom_requests(customer_name,phone,email,product_name,category,description,quantity,budget,desired_date,size,color,material,printing_method,design_notes,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?, ?, ?)',
    [
      String(payload.customerName).trim(),
      String(payload.phone).trim(),
      String(payload.email || ''),
      String(payload.productName).trim(),
      String(payload.category || ''),
      String(payload.description).trim(),
      quantity,
      String(payload.budget || ''),
      String(payload.desiredDate || ''),
      String(payload.size || ''),
      String(payload.color || ''),
      String(payload.material || ''),
      String(payload.printingMethod || ''),
      String(payload.designInstructions || ''),
      'Submitted'
    ]
  );

  const request = await get('SELECT * FROM custom_requests WHERE id=?', [result.lastID]);
  res.status(201).json(request);
});

app.get('/api/orders', async (_req, res) => {
  try {
    const orders = await all('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders.map((order) => ({ ...order, items: safeJSONParse(order.items, []) })));
  } catch (error) {
    res.status(500).json({ error: 'Could not load orders.' });
  }
});

app.post('/api/orders', async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ error: 'Cart is empty.' });

  try {
    await run('BEGIN IMMEDIATE');
    let total = 0;
    const prepared = [];

    for (const item of items) {
      const id = number(item.id, -1);
      const quantity = number(item.quantity, 1);
      if (id < 1 || quantity < 1) continue;

      const product = await get('SELECT * FROM products WHERE id=? AND visible=1', [id]);
      if (!product || product.stock < quantity) {
        throw new Error(`Insufficient or unavailable stock for ${product ? product.name : 'selected product'}.`);
      }

      total += Number(product.price) * quantity;
      prepared.push({ id: product.id, name: product.name, price: Number(product.price), quantity });
    }

    if (!prepared.length) {
      throw new Error('No valid products were found in the cart.');
    }

    for (const item of prepared) {
      await run('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id=?', [item.quantity, item.id]);
    }

    const result = await run(
      'INSERT INTO orders(customer_name, phone, status, total, items) VALUES(?, ?, ?, ?, ?)',
      [String(req.body.customerName || 'Guest').slice(0, 120), String(req.body.phone || '').slice(0, 40), 'Pending', total, JSON.stringify(prepared)]
    );

    await run('COMMIT');
    const order = await get('SELECT * FROM orders WHERE id=?', [result.lastID]);
    res.status(201).json({ ...order, items: safeJSONParse(order.items, []) });
  } catch (error) {
    await run('ROLLBACK').catch(() => {});
    res.status(400).json({ error: error.message || 'Could not create order.' });
  }
});

app.use((err, _req, res, _next) => {
  res.status(400).json({ error: err?.message || 'Invalid request.' });
});

async function startServer() {
  await seedDefaults();
  const port = process.env.PORT || 3000;
  return app.listen(port, () => {
    console.log(`Royal Store listening on ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { app, startServer };

