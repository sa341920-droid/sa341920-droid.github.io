# Royal Mobile And Printing Store

Express + SQLite business application foundation. Local run: `npm install && npm start`, then visit `http://localhost:3000`. Data is stored under `data/` or `DATA_DIR`; use persistent storage in deployment. `OWNER_PASSWORD` must be configured on the server for owner sign-in. Customer accounts use scrypt password hashes. Session cookies are HttpOnly and SameSite=Lax; HTTPS is enabled by production Secure cookie flag.

## Implemented in this phase

- Persistent catalog/settings/themes and 100+ sample products.
- Product CRUD, owner authentication gate, audit trail, customer registration/login/logout.
- Guest or signed-in pending orders with stock checks, basic delivery method/address, order tracking endpoint, and payment records. No client can confirm a gateway payment; gateway provider webhooks are not integrated.
- Customer return request and owner review endpoints, custom request intake and owner status/quote fields, management summary and health endpoints.
- 20 theme palettes; storefront, basic account flows via API, owner panel.

## Security and production limitations

Set `OWNER_PASSWORD` before using owner APIs. Owner routes require an owner session; don't expose a deployment until HTTPS, secret management, backups, rate limits, and security review are complete. Customers can self-register. This version does not yet include secure customer image uploads, exchange inventory workflows, gateway webhooks, email/SMS/WhatsApp notifications, AI/social APIs, a real 3D designer/export pipeline, full POS, supplier/accounting modules, encrypted independent backups or tested restore, or automatic releases. Sample inventory and pending orders are not paid sales. GitHub Pages cannot run this backend.

## Tests

Run `npm test` after `npm install`. The GitHub API integration environment does not provide a runtime, so tests must be run in a Node environment before deployment.
