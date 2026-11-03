# Royal Marketplace — Full-stack production-oriented foundation

Royal Marketplace · Faisalabad, Punjab, Pakistan · Support 03040011041

This is a genuine server/database-based application foundation, not a browser-only localStorage mock. It includes a Node.js/Express API, PostgreSQL schema, JWT auth, password hashing, role middleware, server-side product/order validation, stock locking during checkout, customer order history, seller application flow, admin order/seller endpoints, COD checkout and a payment-provider adapter boundary.

## Important launch status
This source package is **not yet live/production-certified**. You must deploy it, apply schema, configure secure secrets, create an initial admin, and implement/configure the exact online gateway integration based on your approved merchant account. The payment adapter fails closed instead of pretending to accept money. Online checkout will return a setup error until a real provider adapter and webhook signature verification are implemented. Never use client redirects as payment proof. Do not claim production-ready until security testing, backups, monitoring, gateway certification and shipping operations are completed.

## Stack
Node.js 20+, Express, PostgreSQL 16, pg, bcryptjs, JWT, Zod validation, Helmet, rate limiting, Docker Compose.

## Run locally
1. Install Node.js 20+ and Docker.
2. Copy `.env.example` to `.env`; set a strong unique JWT_SECRET (minimum 32 chars), database URL and frontend origin.
3. Start PostgreSQL. For Compose, set DB_PASSWORD in environment and update DATABASE_URL to host `db`, user `royal`.
4. `npm ci`
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
Full admin/seller user interface, product/category admin CRUD UI, seller commission/payout ledger, email/SMS OTP and password reset, shipping label/courier API, verified gateway callback adapter, refund gateway execution, idempotency strategy, audit logs, image storage/CDN, fraud controls, integration/e2e tests, legal/privacy/return policy and operational support workflows. These are intentionally identified, not represented as already complete.
