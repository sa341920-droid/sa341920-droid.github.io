# Royal Mobile And Printing Store — Marketplace foundation

Royal Marketplace · Faisalabad, Punjab, Pakistan · Support 03040011041

This is a genuine server/database-based application foundation, not a browser-only localStorage mock. It includes a Node.js/Express API, PostgreSQL schema, JWT auth, password hashing, role middleware, server-side product/order validation, stock locking during checkout, customer order history, seller application flow, admin order/seller endpoints, COD checkout and a payment-provider adapter boundary.

## Important launch status
This source package is **not yet live/production-certified**. You must deploy it, apply schema, configure secure secrets, create an initial admin, and implement/configure the exact online gateway integration based on your approved merchant account. The payment adapter fails closed instead of pretending to accept money. Online checkout will return a setup error until a real provider adapter and webhook signature verification are implemented. Never use client redirects as payment proof. Do not claim production-ready until security testing, backups, monitoring, gateway certification and shipping operations are completed.

## Stack
Node.js 20+, Express, PostgreSQL 16, pg, bcryptjs, JWT, Zod validation, Helmet, rate limiting, Docker Compose.

## Run locally
1. Install Node.js 20+ and Docker.
2. Copy `.env.example` to `.env`; set a strong unique JWT_SECRET (minimum 32 chars), database URL and frontend origin.
3. Start PostgreSQL. For Compose, set the same strong password in `DB_PASSWORD` and in `DATABASE_URL` (host `db`, user `royal`). The Compose app container applies the schema before starting the API.
4. `npm install`
5. `npm run db:migrate`
6. `npm start`
7. Visit `http://localhost:3000`.

## Create first admin securely
Register a user through `/api/auth/register`, then use a trusted DB admin session (not a public endpoint) to promote that account:
`UPDATE users SET role='ADMIN' WHERE email='your-controlled-email@example.com';`
Never expose role promotion as public API.

## GitHub
GitHub is for source code, not for hosting the Node API or PostgreSQL. GitHub Pages cannot execute this backend. Deploy container to a Node-capable host and managed PostgreSQL; configure HTTPS, environment secrets, backups, migrations and exact FRONTEND_ORIGIN. Do not commit `.env`.

## Payment gateway choices
For Pakistan, merchant access is subject to gateway onboarding. JazzCash documents mobile-account, card and voucher flows; see https://corporateonboarding.jazzcash.com.pk/online-payment and https://payments.jazzcash.com.pk/SandboxDocumentation/Content/documentation/Payment%20Gateway%20Integration%20Guide%20for%20Merchants-v4.2.pdf . PayFast also has API docs at https://gopayfast.com/docs/ . Choose the actual merchant provider and implement its create-payment API plus cryptographically verified webhook in `src/payment.js`. Use provider's sandbox before live credentials. Never paste credentials into client-side code or GitHub.

## API summary
- `POST /api/auth/register`, `/api/auth/login`; `GET /api/me`
- `GET /api/categories`, `GET /api/products`, `GET /api/products/:id`
- Seller: `POST /api/seller/apply`; approved seller/admin: `POST /api/products`
- Authenticated: `POST /api/orders`, `GET /api/orders`, `POST /api/returns`
- Admin: `GET /api/admin/summary`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`, `GET /api/admin/sellers`, `PATCH /api/admin/sellers/:id`

## Added feature foundations in this revision
The existing schema is extended additively (existing tables and data are retained) with product variants, wishlists, owner-managed public storefront settings, order notes, shipping methods, payment records, notification queue, custom-production jobs, audit logs, backup-run records and system events. Orders now have guest-email, tracking, shipping, delivery-estimate and notes fields; products have SKU/barcode and SEO metadata fields. New protected APIs provide wishlist management, public storefront settings, owner settings writes, order tracking by order number plus phone, admin order notes/shipping updates, basic sales reporting and a system-health summary. New order enum values include READY_FOR_DISPATCH and RETURNED.

The existing server file also contained a JavaScript syntax error in the seller-application SQL string and admin summary response; these were corrected so the server parses. Node syntax checks were run on the server and supporting JavaScript files.

These are data/API foundations, **not a claim that all requested workflows are complete**. In particular guest checkout is not yet wired into order creation; customer-facing website pages/account dashboard, full Owner Panel UI, advanced variant checkout/pricing, returns approval/exchange/refund execution, production file processing/export, notification channel providers, secure media upload/scanning, gateway adapters/webhooks, full backup/restore automation, deployment rollback, and end-to-end/device/load/recovery tests still require implementation and deployment-specific configuration.

## Features needing further implementation before commercial launch
Full admin/seller user interface, product/category admin CRUD UI, seller commission/payout ledger, email/SMS OTP and password reset, shipping label/courier API, verified gateway callback adapter, refund gateway execution, idempotency strategy, audit logs, image storage/CDN, fraud controls, integration/e2e tests, legal/privacy/return policy and operational support workflows. These are intentionally identified, not represented as already complete.
