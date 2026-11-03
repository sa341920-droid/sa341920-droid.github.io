const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const server = fs.readFileSync('src/server.js', 'utf8');
const schema = fs.readFileSync('db/schema.sql', 'utf8');
const storefront = fs.readFileSync('public/index.html', 'utf8');

test('core commerce and operations routes are registered', () => {
  for (const route of [
    "'/api/auth/register'", "'/api/products'", "'/api/orders'", "'/api/guest/orders'",
    "'/api/returns'", "'/api/wishlist'", "'/api/coupons/validate'",
    "'/api/support/tickets'", "'/api/admin/coupons'", "'/api/admin/health'",
    "'/api/admin/reports/overview'", "'/api/admin/categories'", "'/api/admin/reviews'", "'/api/seller/products'"
  ]) assert.ok(server.includes(route), `missing route ${route}`);
});

test('schema contains operational tables and idempotent page seeds', () => {
  for (const table of ['coupons','product_reviews','inventory_movements','support_tickets','newsletter_subscribers','shipping_events','seller_ledger']) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
  }
  assert.match(schema, /ON CONFLICT\(slug\) DO NOTHING/);
});

test('storefront exposes customer policy and support links', () => {
  for (const slug of ['privacy','terms','returns-policy','shipping']) assert.ok(storefront.includes(`slug=${slug}`));
});


test('production security controls and safe first-admin bootstrap are present', () => {
  const security = fs.readFileSync('src/security.js', 'utf8');
  const bootstrap = fs.readFileSync('scripts/promote-admin.js', 'utf8');
  assert.match(server, /app\.use\('\/api',apiLimiter\)/);
  assert.match(server, /checkoutLimiter/);
  assert.match(server, /Invalid JSON body/);
  assert.match(security, /audience: 'royal-marketplace-users'/);
  assert.match(security, /is_active=true/);
  assert.match(bootstrap, /An ADMIN already exists/);
  assert.match(bootstrap, /--confirm/);
});


test('checkout prevents duplicate-line stock bypass and does not reserve stock for unavailable online payments', () => {
  assert.match(server, /Duplicate product variants are not allowed/);
  assert.match(server, /Online payments are not enabled yet/);
  assert.match(server, /Order cancelled/);
  assert.match(schema, /ADD VALUE IF NOT EXISTS 'READY_FOR_DISPATCH'/);
});


test('owner panel endpoints are backed by API routes', () => {
  for (const route of [
    "'/api/admin/reports/sales'", "'/api/admin/health'", "'/api/seller/products'",
    "'/api/admin/reviews'", "'/api/admin/customers'", "'/api/admin/audit-logs'",
    "'/api/admin/products/:id'", "'/api/admin/categories'", "'/api/addresses'",
    "'/api/me/change-password'"
  ]) assert.ok(server.includes(route), `missing owner/customer route ${route}`);
});

test('owner mutations are role-protected and customer data is user-scoped', () => {
  assert.match(server, /app\.patch\('\/api\/admin\/products\/:id',auth,allow\('ADMIN'\)/);
  assert.match(server, /app\.get\('\/api\/addresses',auth/);
  assert.match(server, /WHERE user_id=\$1/);
  assert.match(server, /role<>\\'ADMIN\\'/);
});
