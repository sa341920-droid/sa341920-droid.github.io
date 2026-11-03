# Royal Mobile And Printing Store — Extended full-stack commerce source

Royal Marketplace · Faisalabad, Punjab, Pakistan · Support 03040011041

This is a genuine server/database-based application foundation, not a browser-only localStorage mock. It includes a Node.js/Express API, PostgreSQL schema, JWT auth, password hashing, role middleware, server-side product/order validation, stock locking during checkout, customer order history, seller application flow, admin order/seller endpoints, COD checkout and a payment-provider adapter boundary.

## Important launch status
This source package is **not yet live/production-certified**. You must deploy it, apply schema, configure secure secrets, create an initial admin, and implement/configure the exact online gateway integration based on your approved merchant account. The payment adapter fails closed instead of pretending to accept money. Online checkout will return a setup error until a real provider adapter and webhook signature verification are implemented. Never use client redirects as payment proof. Do not claim production-ready until security testing, backups, monitoring, gateway certification and shipping operations are completed.

## Stack
Node.js 20+, Express, PostgreSQL 16, pg, bcryptjs, JWT, Zod validation, Helmet, rate limiting, Docker Compose.

## Deploy on Vercel + Supabase free tiers\nSee `DEPLOY-ON-FREE-PLAN.md` for the deployment walkthrough. The `vercel.json` and `api/index.js` files expose the Express API as a serverless function. Apply `db/schema.sql` in Supabase before deploying.\n\n## Run locally
1. Install Node.js 20+ and Docker.
2. Copy `.env.example` to `.env`; set a strong unique JWT_SECRET (minimum 32 chars), database URL and frontend origin.
3. Start PostgreSQL. For Compose, set `DB_PASSWORD` in `.env`; Compose overrides the app database host to `db` and uses the `royal` database user.
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

## Features needing further implementation before commercial launch
Seller payout settlement, email/SMS OTP and password reset, shipping label/courier API, verified gateway callback adapter, refund gateway execution, idempotent checkout, image storage/CDN, malware scanning, fraud controls, full integration/e2e tests, automated backups/restore, and outbound email/SMS/WhatsApp delivery. Admin interfaces remain partial. These are intentionally identified, not represented as already complete.


## Additive modules in this revision
The original application files and existing routes are retained. Additive PostgreSQL tables and API routes now provide the first integration layer for: product variants, customer wishlists, owner-managed storefront key/value settings and editable page content, order tracking metadata, order notes, payment records, shipping methods, return cases, in-app notification queue, custom production jobs/files, audit records, backup run records, automation run records, owner health summary, and daily sales aggregation.

### Added API routes
- Guest: `POST /api/guest/orders` (COD guest checkout)
- Customer account: `GET/POST /api/account/addresses`, `DELETE /api/account/addresses/:id`, `GET /api/orders/:id`
- Customer service: `POST /api/support/tickets`, `GET /api/support/tickets`, `POST /api/newsletter`
- Product trust: `GET /api/products/:id/reviews`, `POST /api/products/:id/reviews` (verified delivered-order buyers; moderation required)
- Promotions: `POST /api/coupons/validate`; admin coupon CRUD/enable-disable
- Inventory: admin stock adjustment with immutable movement history
- Fulfilment: admin tracking-event updates; public tracking includes carrier timeline
- Admin: support ticket queue/status, inventory movements and business overview report
- Public: `GET /api/storefront/settings`, `GET /api/pages/:slug`, `GET /api/products/:id/variants`, `GET /api/track/:orderNumber`
- Customer: `GET/POST/DELETE /api/wishlist`, `POST /api/production/jobs`, `GET /api/notifications`
- Owner/Admin: `PUT /api/admin/storefront/settings`, `PUT /api/admin/pages/:slug`, product variant creation, shipping methods, return review, production job review, `GET /api/admin/health`, `GET /api/admin/reports/sales`

### Additional source features in this revision
The storefront now permits COD guest checkout with email capture, includes information/policy pages and newsletter signup, and the admin page exposes dashboard/report, order, seller, returns, support, coupons, shipping and production data views plus order-status and coupon quick actions. Added backend modules include customer address book, order detail, verified-buyer reviews with moderation, coupon validation/management, stock adjustment ledger, support tickets, newsletter subscribers, shipment event history, and operational report endpoints. Schema seeds basic About, Privacy, Terms, Returns and Shipping content if those slugs do not already exist.

### Important implementation and verification limits
This remains a source-code revision, not a deployed or 100%-certified commerce system. No live PostgreSQL instance, merchant gateway credentials, courier credentials, SMTP/SMS/WhatsApp provider credentials, object-storage account, malware scanner, or deployment host was supplied, so those integrations and end-to-end workflows cannot be truthfully reported as tested. Online payment is intentionally not marked paid by a browser response; a real provider adapter and verified webhook are still required. Full customer-facing account/dashboard experience, production-grade private upload/storage and 20-file upload testing, invoice/PDF generation, complete return/refund inventory workflow, notification delivery workers, backup encryption/restore drills, automated release/rollback, and device/network performance testing still require implementation and deployment validation.

### Run
Use Node.js 20+ and PostgreSQL 16. Configure `.env` from `.env.example`, run `npm install`, `npm run db:migrate`, then `npm start`. Docker startup now applies the schema before starting the API. No admin account or sample products are seeded; create the first account and promote it using the trusted database procedure described above.
