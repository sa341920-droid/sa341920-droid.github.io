# Royal Mobile And Printing Store

A responsive storefront and an initial Node.js/Express + SQLite application foundation. Public pages use the same persistent product, category, store-settings, and theme data served by the API. This is an incremental foundation—not the complete business platform in `Royal_Mobile_Printing_Store_GitHub_Master_Prompt-1.md`.

## Run locally

Requires Node.js 18 or later and npm. The API server creates `data/royal_store.db` and seeds categories, 20 theme palettes, and 120 editable sample products on first start.

```sh
npm install
npm start
```

Open http://localhost:3000 and `/owner.html`. `DATA_DIR` can point at a persistent writable directory; `PORT` sets the HTTP port. Protect the owner panel behind a trusted private network/reverse proxy until authentication and server-side authorization are implemented. The current owner endpoints are not authenticated and must not be exposed as a production admin service.

## Current implemented foundation

- SQLite persistence for product catalog, categories, store settings, themes, custom request text fields, and basic orders.
- Product listing and owner CRUD API, store settings API, theme activation, basic custom request submission, and stock-aware order creation.
- Storefront and owner panel wired to the API; 120 clearly sample/demo products (not sales), 20 theme palettes.
- Automated API tests: `npm test`.

## Important gaps and limitations

This version does **not** implement authentication, role permissions, private secure customer file storage, payment verification, customer accounts, full POS, finance, suppliers, returns, social posting, AI integrations, actual 3D product design/export, scheduling/automation, encrypted independent backups/recovery, or release rollback. Custom request image uploads are not accepted yet. Gateway, AI, and social provider configuration and credentials are also absent. Do not treat demo products or basic orders as real paid transactions. GitHub Pages serves static files only and cannot run this Node server; production requires a Node-capable host, persistent database/storage, HTTPS, secrets/configuration, and security review. No production readiness or deployment verification is claimed.

## Deploy

Configure a Node host to run `npm start`, mount persistent storage and set `DATA_DIR`, and enable HTTPS at the host/reverse proxy. The static GitHub Pages deployment cannot provide the API or shared SQLite persistence.
