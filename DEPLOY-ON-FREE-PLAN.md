# Royal Mobile And Printing Store — Free-plan deployment notes

This package adds Vercel serverless routing to the existing Express/PostgreSQL app.
It does **not** deploy itself and does not include database credentials.

## Accounts/services
- Vercel free Hobby project for the website + API functions.
- Supabase Free project for PostgreSQL.
- GitHub repository for source control.

Free tiers and limits can change. A free plan is not a promise of uninterrupted
commercial service; review the providers' current terms and limits before launch.

## 1) Create the Supabase database
1. Create a Supabase project.
2. Open **Project Settings → Database → Connection string**.
3. Choose the **Session pooler** connection string (not the direct connection if
   your deployment environment cannot use IPv6).
4. Copy the URI and replace its password placeholder with the database password.
5. Keep this URI private. Do not put it in browser code or commit it to GitHub.

## 2) Apply the database schema
1. In Supabase, open **SQL Editor → New query**.
2. Paste the complete contents of `db/schema.sql`.
3. Run it once and confirm it completes without errors.

## 3) Deploy from GitHub to Vercel
1. Push this project folder to a GitHub repository (the repository root must contain
   `vercel.json`, `api/`, `public/`, `src/`, and `db/`).
2. In Vercel, choose **Add New → Project**, import that repository.
3. Use the detected project settings; the included `vercel.json` routes `/api/*`
   to the Express function and other paths to the static `public/` site.
4. In **Project → Settings → Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = the private Supabase session-pooler URI
   - `JWT_SECRET` = a unique random secret of at least 32 characters
   - `FRONTEND_ORIGIN` = the exact deployed Vercel URL, e.g. `https://your-project.vercel.app`
   - `JWT_EXPIRES_IN` = `1h`
   - `STORE_NAME` = `Royal Marketplace`
   - `STORE_PHONE` = `03040011041`
   - `STORE_LOCATION` = `Faisalabad Punjab Pakistan`
5. Redeploy after setting the variables.

Generate a strong JWT secret locally; do not send it in chat. Example command:
`openssl rand -base64 48`

## 4) Create the first Owner/Admin
1. Open the deployed store and register an account using an email you control.
2. In Supabase SQL Editor, run this query after replacing the email:
   `UPDATE users SET role='ADMIN' WHERE email=lower('YOUR-EMAIL@example.com');`
3. Log out and log back in so the new admin role is reflected in the login token.
4. Open `/admin.html`.

Never add a public endpoint that lets visitors promote themselves to admin.

## 5) Verify
- Open `/api/health`; it should return JSON with `ok: true`.
- Open the storefront; product list should load (it will be empty until you add products).
- Sign in as the admin and verify the admin API calls.

## Important limits / unfinished integrations
- GitHub Pages cannot run this Node.js API. The deployed frontend and API must be served by
  Vercel (or another Node-capable host), not GitHub Pages alone.
- The included online payment adapter is intentionally fail-closed. Online payments are
  not active until a real Pakistan merchant gateway adapter and verified webhook are
  configured. Cash on Delivery is the available checkout path.
- Email/SMS/WhatsApp delivery, courier API, seller payouts, private media storage,
  backup/restore drills, and production security review still need implementation.
- No account credentials, payment keys, or database passwords are included.
- Vercel/Supabase free-plan limits and availability may change. Check current terms,
  particularly for commercial use, before relying on a free tier.
