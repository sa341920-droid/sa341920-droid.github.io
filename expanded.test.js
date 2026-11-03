const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const server = fs.readFileSync('src/server.js', 'utf8');
const schema = fs.readFileSync('db/schema.sql', 'utf8');
const owner = fs.readFileSync('public/admin.html', 'utf8');
const ownerJs = fs.readFileSync('public/admin.js', 'utf8');
const storefrontJs = fs.readFileSync('public/app.js', 'utf8');

test('checkout uses a single transactional path for customer and guest orders', () => {
  assert.match(server, /async function createOrder\(/);
  assert.match(server, /BEGIN/);
  assert.match(server, /FOR UPDATE/);
  assert.match(server, /inventory_movements/);
  assert.match(server, /checkout_idempotency/);
  assert.match(server, /app\.post\('\/api\/guest\/orders'/);
  assert.match(server, /app\.post\('\/api\/orders'/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS checkout_idempotency/);
  assert.match(schema, /ADD COLUMN IF NOT EXISTS variant_id/);
});

test('checkout applies validated shipping and coupon pricing on the server', () => {
  assert.match(server, /FROM shipping_methods WHERE id=\$1 AND enabled=true FOR SHARE/);
  assert.match(server, /FROM coupons WHERE code=upper\(\$1\).*FOR UPDATE/);
  assert.match(server, /coupon_redemptions/);
  assert.match(server, /shipping_pkr,discount_pkr,coupon_code,shipping_method_id,total_pkr/);
  assert.match(server, /Idempotency-Key/);
  assert.match(storefrontJs, /rm_pending_checkout/);
});

test('owner panel has live management forms and safe text-only result rendering', () => {
  for (const action of ['product','category','orderStatus','payment','seller','customer','review','coupon','shipping','return','ticket','ticketMessage','tracking','inventory','production','page','setting','shippingEdit','productEdit','pos','expense','campaign','variant','variantEdit']) {
    assert.ok(owner.includes(`data-action="${action}"`), `missing owner action ${action}`);
  }
  assert.match(ownerJs, /textContent=JSON\.stringify/);
  assert.match(owner, /data-path="\/admin\/health"/);
  assert.match(owner, /data-path="\/admin\/backup-runs"/);
  assert.match(owner, /data-path="\/admin\/reports\/profit-loss"/);
});

test('admin route registrations are unique to prevent shadowed handlers', () => {
  const routes = [...server.matchAll(/app\.(get|post|put|patch|delete)\('([^']+)'(?!,checkoutLimiter)/g)].map(m => `${m[1]} ${m[2]}`);
  assert.equal(routes.length, new Set(routes).size, 'duplicate Express method/path registration');
});

test('order state and payment safety are enforced server-side', () => {
  assert.match(server, /Order cannot move from/);
  assert.match(server, /Confirm Cash on Delivery only after the order is delivered/);
  assert.match(server, /Online payment must be confirmed by a verified provider webhook/);
  assert.match(server, /Delivered order not found/);
});


test('POS, expenses, profit-loss and campaign draft modules are registered', () => {
  for (const route of [
    "'/api/admin/pos/sales'", "'/api/admin/accounting/expenses'", "'/api/admin/accounting/entries'",
    "'/api/admin/reports/profit-loss'", "'/api/admin/campaigns'", "'/sitemap.xml'"
  ]) {
    assert.ok(server.includes(route), `missing route ${route}`);
  }
  assert.match(schema, /CREATE TABLE IF NOT EXISTS accounting_entries/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS marketing_campaigns/);
  assert.match(schema, /'POS_CASH'/);
});

test('public pages use external scripts rather than inline script/event handlers', () => {
  for (const file of fs.readdirSync('public').filter(name => name.endsWith('.html'))) {
    const html = fs.readFileSync(`public/${file}`, 'utf8');
    assert.doesNotMatch(html, /<script>\s*[\s\S]*?<\/script>/i, `${file} contains inline script`);
    assert.doesNotMatch(html, /\son(click|submit|change)=/i, `${file} contains inline event handler`);
  }
  assert.match(fs.readFileSync('public/_headers','utf8'), /Content-Security-Policy/);
});


test('product variants are selected and stock-managed through checkout and POS', () => {
  assert.match(server, /SELECT \* FROM product_variants WHERE id=\$1 AND product_id=\$2 FOR UPDATE/);
  assert.match(server, /UPDATE product_variants SET stock=stock-\$1/);
  assert.match(server, /UPDATE product_variants SET stock=stock\+\$1/);
  assert.match(schema, /ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES product_variants/);
  assert.match(fs.readFileSync('public/product.js','utf8'), /variantSelect/);
  assert.match(fs.readFileSync('public/app.js','utf8'), /variantId:x\.variantId/);
});


test('owner navigation endpoints and page script references resolve to source files/routes', () => {
  const paths = [...owner.matchAll(/data-path="([^"]+)"/g)].map(m => m[1]);
  const routeDefs = [...server.matchAll(/app\.(?:get|post|put|patch|delete)\('([^']+)'/g)].map(m => m[1]);
  for (const path of paths) {
    const target = '/api' + path.replace('PLACEHOLDER','sample-id');
    const matched = routeDefs.some(route => {
      const a=route.split('/'), b=target.split('/');
      return a.length===b.length && a.every((part,i)=>part.startsWith(':')||part===b[i]);
    });
    assert.ok(matched, `Owner navigation path has no API route: ${path}`);
  }
  for (const file of fs.readdirSync('public').filter(name=>name.endsWith('.html'))) {
    const html=fs.readFileSync(`public/${file}`,'utf8');
    for (const match of html.matchAll(/<script[^>]+src="\/([^\"]+)"/g)) {
      assert.ok(fs.existsSync(`public/${match[1]}`), `${file} references missing script ${match[1]}`);
    }
  }
});


test('seller center exposes approved-seller products, orders and ledger APIs', () => {
  for (const route of ["'/api/seller/summary'", "'/api/seller/products'", "'/api/seller/orders'", "'/api/seller/ledger'", "'/api/seller/apply'"]) {
    assert.ok(server.includes(route), `missing seller route ${route}`);
  }
  assert.match(fs.readFileSync('public/seller.html','utf8'), /id="dashboard"/);
  assert.match(fs.readFileSync('public/seller.js','utf8'), /\/seller\/orders/);
});
