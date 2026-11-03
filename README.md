# Royal Mobile And Printing Store — marketplace and owner operations suite

A full-stack source project for Royal Mobile And Printing Store, Faisalabad, Pakistan. It contains a Node.js/Express API, PostgreSQL schema, customer storefront, customer account area, seller portal, seller application flow, Owner Panel, POS, printing-job intake, inventory and fulfilment tools, reports, and Cloudflare deployment/backup workflows.

> **Release status:** feature-rich source package; not deployed or production-certified. The automated checks are source and syntax tests, not live-database or end-to-end tests. Do not take live payments until a real merchant gateway and verified webhook are installed.

## Included features

### Storefront and customer experience
- Product catalogue, categories, search, sorting, product detail pages, variants, stock visibility, wishlist and moderated verified-buyer reviews.
- Cart and guest/customer checkout with Cash on Delivery, shipping-method calculation, coupon calculation/redemption, stock locking, and idempotency keys to protect against duplicate checkout submissions.
- Customer profile, password change, saved addresses, order history, tracking timeline, invoice print/PDF via browser print, data export, support tickets, return requests, seller application, return requests, and custom printing/production job requests.
- Newsletter signup and public store/policy pages.

### Owner Panel (`/admin.html`)
- Orders and state transitions, tracking events, COD payment confirmation, order notes, sellers, customers, products, categories, variants, reviews, returns and optional returned-stock restoration.
- Inventory adjustments with movement history, shipping methods, coupons, support tickets and replies, printing jobs, storefront settings, editable policy pages, audit logs, backup/automation/notification history.
- Walk-in POS sales, expense entry, operational profit/loss view, seller ledger lookup, and email/SMS/WhatsApp campaign drafts.
- Admin access is checked against the current database role on every API request. A customer token is not sufficient to use owner endpoints.

### Operations and security
- PostgreSQL schema and migration command; bcrypt password hashing; short-lived issuer/audience-bound JWTs; active-account/current-role revalidation; role-protected owner endpoints.
- Helmet security headers and CSP, origin allow-list CORS, API/auth/checkout rate limits, input validation, parameterized SQL, stock row locks, order transition checks, and audit/inventory records.
- Daily encrypted PostgreSQL backup workflow with a temporary PostgreSQL restore validation and Cloudflare R2 upload.
- GitHub Actions CI on pushes/PRs and weekly Dependabot update PRs for npm packages and GitHub Actions; dependency updates are reviewed before merging. This workflow backs up the database only, not product images or other objects.
- Cloudflare Pages configuration for the static storefront and `/api/*` proxy to the Node API host. The Express API remains on a Node-capable host.
- Product detail metadata, JSON-LD and a dynamic `/sitemap.xml` route.

## Run locally

Requirements: Node.js 20+ and PostgreSQL 16+.

1. Copy `.env.example` to `.env` and set a unique `JWT_SECRET` (at least 32 characters), `DATABASE_URL`, `FRONTEND_ORIGIN`, and `PUBLIC_SITE_URL`. For managed PostgreSQL set `DATABASE_SSL=true`; keep certificate verification enabled. `DATABASE_SSL=false` is only for local/Docker PostgreSQL that does not provide TLS.
2. Install dependencies: `npm install`.
3. Apply the schema: `npm run db:migrate`.
4. Start: `npm start`.
5. Register/promote the owner, then open `/admin.html` and create at least one shipping method, product category and product before testing customer checkout. Checkout is intentionally blocked until an enabled delivery method is configured.
6. Open `http://localhost:3000`.

The application refuses to start without `DATABASE_URL` and a strong `JWT_SECRET`. In production, it also requires a real `FRONTEND_ORIGIN`.

## Create the first Owner/Admin

1. Register the owner's account from the storefront.
2. From a trusted terminal with database access, run:

```bash
npm run admin:promote -- owner@example.com --confirm
```

The command only promotes an existing active account and refuses to run if an ADMIN already exists. Keep database credentials private. Do not add a public role-promotion endpoint.

## Deployment architecture

- **Cloudflare Pages:** serves `public/` and proxies `/api/*` to the Node backend.
- **Node API:** deploy this repository to Vercel or another Node-capable host. `api/index.js` and `vercel.json` provide the Vercel serverless entry point.
- **Database:** PostgreSQL, e.g. a managed Supabase project.
- **Backups:** GitHub Actions scheduled workflow uploads encrypted PostgreSQL dumps to Cloudflare R2 after a temporary restore test.

See `CLOUDFLARE-SETUP-UR.md` and `DEPLOY-ON-FREE-PLAN.md`. The Cloudflare workflow intentionally stops if the API hostname is still a placeholder. No credentials or private service keys are included in this package.

## External integrations that still require real provider accounts/configuration

These cannot be safely or truthfully activated using dummy values:
- Online gateway creation, signed webhook verification, refunds and live payment certification. `src/payment.js` intentionally fails closed. COD and owner-recorded POS sales are the available local payment flows.
- Email, SMS and WhatsApp sending. Newsletter subscriptions and campaign drafts are stored, but no message delivery worker/provider is connected.
- Courier booking, labels, live rates and carrier webhooks. Shipping methods and manual tracking events are available.
- Private image/file upload storage, malware scanning, signed private downloads, object backup and retention. Product images currently use configured image URLs.
- Seller bank payouts and settlement execution. Seller ledger storage exists; no bank/payment payout provider is connected.
- Full staff permissions, MFA/password-reset email delivery, tax/accounting certification, COGS/payroll/tax ledger, and formal financial statements. The included profit/loss page is an operational paid-revenue-minus-recorded-expenses view only.
- A production 3D product designer and advanced file conversion/export pipeline.

## Backup requirements

Configure these GitHub Actions secrets before the daily workflow can run:
- `BACKUP_DATABASE_URL`
- `BACKUP_ENCRYPTION_KEY`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BACKUP_BUCKET`

The restore check uses a temporary PostgreSQL service on the GitHub Actions runner. The workflow does not automatically update the Owner Panel's `backup_runs` table, and does not include media/object storage. Keep an independent backup and test recovery before production launch. GitHub Actions CI runs source tests; Dependabot opens weekly update PRs rather than silently installing updates in production.

## Verification

Run `npm test` (**17/17 source tests currently pass**). It executes Node's built-in test runner and syntax checks. Tests verify route registration, schema/source safeguards, unique Express method/path registrations, checkout protections, seller/owner forms, page script references, and absence of inline scripts. They do **not** prove database migrations, payments, email, courier, backups, Cloudflare deployment, load, or security are working end-to-end. The default rate limiter is in-memory per API instance; a multi-instance production rollout should use a shared Redis/Valkey rate-limit store.
