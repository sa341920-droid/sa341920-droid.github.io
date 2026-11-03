const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../server');
const { seedDefaults, db } = require('../db');

before(async () => seedDefaults());
after(() => new Promise((resolve, reject) => db.close(error => error ? reject(error) : resolve())));

test('health check confirms database connection', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'ok');
});

test('storefront seeds at least 100 products and 20 themes', async () => {
  const response = await request(app).get('/api/storefront').expect(200);
  assert.ok(response.body.products.length >= 100);
  assert.equal(response.body.themes.length, 20);
  assert.ok(response.body.categories.length >= 5);
});

test('product create and update are persisted', async () => {
  const sku = `TEST-${Date.now()}`;
  const created = await request(app).post('/api/products').send({name:'Test item',category:'Printing',sku,price:250,stock:5}).expect(201);
  await request(app).put(`/api/products/${created.body.id}`).send({name:'Updated test item',price:300,stock:4}).expect(200);
  const products = await request(app).get('/api/products').expect(200);
  assert.ok(products.body.some(product => product.sku === sku && product.name === 'Updated test item' && product.price === 300));
  await request(app).delete(`/api/products/${created.body.id}`).expect(200);
});

test('custom request validates required fields and accepts a valid request', async () => {
  await request(app).post('/api/requests').send({}).expect(400);
  const response = await request(app).post('/api/requests').send({customerName:'Test customer',phone:'03000000000',productName:'Custom mug',description:'Blue mug with logo',quantity:2}).expect(201);
  assert.equal(response.body.status, 'Submitted');
  assert.equal(response.body.quantity, 2);
});

test('theme activation is persisted and reflected on storefront', async () => {
  await request(app).post('/api/themes/2/activate').expect(200);
  const response = await request(app).get('/api/storefront').expect(200);
  assert.equal(String(response.body.settings.themeId), '2');
  assert.equal(response.body.themes.find(theme => Number(theme.active) === 1).id, 2);
});
