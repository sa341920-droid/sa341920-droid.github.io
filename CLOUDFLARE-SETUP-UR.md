# Cloudflare setup — Royal Mobile And Printing Store

Ye package Cloudflare Pages par frontend aur Node-capable host par API chalane ke liye tayyar kiya gaya hai. Cloudflare Pages static HTML/CSS/JS host karta hai; existing Express + PostgreSQL backend ko Pages par direct run nahi kiya ja sakta.

## Architecture

1. **Cloudflare Pages:** `public/` folder deploy karega.
2. **Node API:** Vercel (ya doosra Node host) par `api/index.js` / `vercel.json` se deploy hoga.
3. **PostgreSQL:** Supabase ya compatible managed PostgreSQL.
4. **API proxy:** Cloudflare Pages Function `functions/api/[[path]].js` same-origin `/api/*` requests ko `API_ORIGIN` par forward karega.
5. **Backups:** GitHub Actions PostgreSQL dump encrypt karega, temporary PostgreSQL par restore-test karega, phir encrypted dump Cloudflare R2 mein upload karega.

## One-time account setup

Aapko apne accounts mein ek martaba ye cheezein authorize/configure karni hongi; secret values chat mein share na karein:

- GitHub repository access.
- Node API host project aur environment variables.
- PostgreSQL database aur connection URL.
- Cloudflare Pages project `royal-marketplace`.
- Cloudflare API token + account ID as GitHub Actions secrets.
- Cloudflare R2 bucket + access key/secret.

## Deploy the API

1. Is complete project ko GitHub repository root mein rakhein (root mein `package.json`, `api/`, `src/`, `db/`, `public/`, `vercel.json` hon).
2. Repository ko Vercel ya Node host se connect karein.
3. `db/schema.sql` ko PostgreSQL database par apply karein (`npm run db:migrate` with `DATABASE_URL` also works from a trusted machine).
4. API host par ye environment variables set karein:
   - `NODE_ENV=production`
   - `DATABASE_URL` (private)
   - `JWT_SECRET` (32+ random characters)
   - `FRONTEND_ORIGIN` (exact Cloudflare Pages/custom domain origin)
   - `PUBLIC_SITE_URL` (public storefront URL)
   - `DATABASE_SSL=true` for managed PostgreSQL; keep TLS certificate verification enabled
   - `JWT_EXPIRES_IN=1h`
   - `PAYMENT_PROVIDER=manual` until a real provider adapter is installed
5. First owner account register karke trusted terminal se `npm run admin:promote -- owner@example.com --confirm` chalayein.
6. `/admin.html` mein login karke kam az kam ek enabled shipping method, product category aur products add karein. Checkout delivery method ke baghair submit nahi hota.

## Cloudflare Pages deployment

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. GitHub repository connect karein. Build command blank rakhein; build output directory `public` rakhein. Root directory repository root hi rahe.
3. Pages project ke Settings → Variables and Secrets → Production mein `API_ORIGIN` set karein. Value deployed Node API ka origin ho, misal: `https://your-api-project.vercel.app` (end mein `/api` na lagayein).
4. API origin `https://` use kare. Preview environment ke liye alag `API_ORIGIN` set karein.
5. API host par `FRONTEND_ORIGIN` ko exact Pages/custom-domain origin set karein, misal `https://royal-marketplace.pages.dev`.
6. GitHub Actions secrets mein `CLOUDFLARE_API_TOKEN` aur `CLOUDFLARE_ACCOUNT_ID` add karein agar GitHub Actions se deploy karna hai.
7. Deploy ke baad `https://YOUR-PAGES-DOMAIN/api/health` khol kar API health verify karein. 503 aaye to `API_ORIGIN` set nahi; 5xx aaye to upstream Node API ya database check karein.

**Important:** Pages Function frontend ke `/api/*` calls ko proxy karti hai. Ye Express/PostgreSQL backend ko Cloudflare Workers mein convert nahi karti. Node API aur PostgreSQL ko alag Node-capable hosting/database par deploy karna zaroori hai.

## Daily encrypted database backup

GitHub repository settings mein Actions secrets add karein:

- `BACKUP_DATABASE_URL`
- `BACKUP_ENCRYPTION_KEY`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_BACKUP_BUCKET`

Workflow roz 02:30 UTC par PostgreSQL dump banata hai, GPG AES-256 se encrypt karta hai, decrypt/restore test temporary PostgreSQL par chalata hai, phir encrypted backup R2 mein upload karta hai.

**Important:** is waqt workflow PostgreSQL database ko backup karta hai. Product images/media objects aur external provider settings backup mein shamil nahi. Owner Panel ke `backup_runs` table mein workflow status automatic write-back bhi abhi connected nahi.

## Live services ke liye abhi provider setup zaroori

- Online payment/refunds: selected merchant gateway ka actual API + signed webhook adapter.
- Email/SMS/WhatsApp: sender accounts, credentials aur delivery workers.
- Courier: merchant account/API credentials aur webhook.
- Private uploads: object storage bucket, access policies, signed URLs, malware scanning.
- Seller payouts: bank/payment provider and reconciliation process.

In credentials ke baghair app fake success report nahi karti. COD aur manually recorded POS transactions available code paths hain; online gateway checkout fail-closed rehta hai.

## Cloudflare security settings

Cloudflare dashboard mein production domain par:

- DDoS protection enabled rakhein; managed WAF rules enable karein.
- Bot protection / Bot Fight Mode available ho to enable karein.
- `/api/auth/*`, `/api/guest/orders` aur `/api/track/*` ke liye edge rate-limit rules configure karein.
- API hostname ko public frontend ke liye proxy ke through use karein; database port ko internet par expose na karein.
- TLS mode `Full (strict)` use karein jab origin certificate valid ho.

Application-level limits is waqt in-memory per API process hain. Multi-instance production scale par shared Redis/Valkey rate-limit store add karna zaroori hai.

## Final checks

- `npm test` local source tests pass hon.
- `/api/health` database connection confirm kare.
- `/admin.html` owner account se login ho.
- Test order, stock deduction/cancellation, coupon, POS receipt, invoice, return and restore flow staging par verify karein.
- Live launch se pehle security, payment, privacy, tax and backup recovery review karwayein.
