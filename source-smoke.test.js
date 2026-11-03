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
