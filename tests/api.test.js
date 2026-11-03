# Royal Mobile And Printing Store

A responsive storefront and a working Node.js + Express + SQLite foundation for the Royal Mobile And Printing Store. The app now serves a storefront and owner dashboard from the same persisted database, with seeded categories, 20 theme palettes, sample products, basic requests, and order creation checks.

## Run locally

```sh
npm install
npm start
```

Then open:
- http://localhost:3000/
- http://localhost:3000/owner.html

The app creates `data/royal_store.db` automatically on first launch.

## Included features

- Storefront catalog from SQLite
- Category filters and search
- Store settings API and theme activation
- Product CRUD in the Owner Panel
- Custom request submission endpoint
- Stock-safe order creation
- 20 theme choices and 100+ demo products
- Automated API tests via Node's built-in test runner

## Important limitations

This is not the complete end-to-end business suite from the project specification. The current version does not include authentication, role permissions, secure private file uploads, payment verification, shipping/returns, AI provider integration, or production deployment security. GitHub Pages alone cannot run this server-side code. A Node-capable host with HTTPS and persistent storage is still required for production deployment.

## Test

```sh
npm test
```

