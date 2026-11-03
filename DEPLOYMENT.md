# Deploy & setup guide

## GitHub Pages (static preview)
Upload the contents to the repository root. Settings → Pages → Deploy from branch → `main` → `/ (root)`.
GitHub Pages serves only static files; it cannot run `backend/server.js`.

## Run the API locally
1. Install Node.js 18+.
2. Copy `.env.example` to `.env`; do not publish secrets.
3. Run `npm install`.
4. Run `npm start`.
5. Visit `http://localhost:3000` and check `http://localhost:3000/api/health`.

## Production deployment
Deploy the Node API on a backend host (Render, Railway, VPS, etc.) and connect PostgreSQL using `backend/schema.sql`.
Then update the frontend to call the deployed API. Configure authentication, server-side admin role checks, payment provider webhooks, courier integrations, emails/SMS, backups, logging and privacy/terms.

The included API is a starter implementation using in-memory arrays. Data resets when the server restarts. The included UI demo currently persists shopping cart, wishlist and orders in the browser only. This package does not claim live payment, secure account or production database operation until configured and tested with the relevant services.
