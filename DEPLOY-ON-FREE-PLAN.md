# Deployment guide — Cloudflare Pages + Node API + PostgreSQL

The included deployment layout is:

- Cloudflare Pages serves the `public/` storefront.
- Vercel (or another Node-capable host) serves the Express API from `api/index.js`.
- Supabase or another managed PostgreSQL service stores application data.
- Cloudflare R2 stores encrypted PostgreSQL backups through the scheduled GitHub Actions workflow.

Free-plan availability, limits and commercial-use terms can change. Verify current provider terms before relying on a free tier.

## 1. Database

1. Create a PostgreSQL database.
2. Copy its private connection URI into the Node host as `DATABASE_URL`.
3. Run `npm run db:migrate` from a trusted environment with Node dependencies installed and `DATABASE_URL` configured, or apply `db/schema.sql` in the database SQL editor.
4. Do not expose the connection URI in browser code, chat, or a public repository.

## 2. Node API host

1. Push the complete project root to a GitHub repository.
2. Import the repository into Vercel or another Node-capable host.
3. Configure `NODE_ENV=production`, `DATABASE_URL`, `JWT_SECRET` (32+ random characters), `FRONTEND_ORIGIN` (exact Cloudflare origin), `PUBLIC_SITE_URL`, `DATABASE_SSL=true`, `JWT_EXPIRES_IN=1h`, and `PAYMENT_PROVIDER=manual`.
4. Deploy the API and verify `/api/health`.
5. Register the owner account and run `npm run admin:promote -- owner@example.com --confirm` from a trusted terminal with database access.
6. Sign in to `/admin.html`; create at least one enabled shipping method, a category and products. Customer checkout remains disabled until a delivery method exists.

## 3. Cloudflare Pages

1. Create a Pages project named `royal-marketplace` from the GitHub repository.
2. Set the output directory to `public`.
3. Replace the placeholder hostname in `public/_redirects` with the actual Node API deployment URL.
4. Add GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
5. Push to `main` or manually run the Cloudflare Pages workflow. It runs `npm test` and refuses to deploy while the API hostname remains a placeholder.

## 4. Backups

Create a Cloudflare R2 bucket and add GitHub Actions secrets:
`BACKUP_DATABASE_URL`, `BACKUP_ENCRYPTION_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_ACCOUNT_ID`, and `R2_BACKUP_BUCKET`.
The scheduled workflow creates an encrypted PostgreSQL dump, restores it to a temporary PostgreSQL service, and uploads the verified encrypted dump to R2. It does not include uploaded media objects.

## 5. External services

Online payment, refunds, courier bookings, email, SMS, WhatsApp and seller payouts require real merchant/provider accounts and provider-specific adapters. They are not activated by entering arbitrary environment variable names. The current payment adapter intentionally fails closed; COD and POS workflows are available.
