# Royal Market Place — Deployment Guide (Urdu/Roman Urdu)

## Architecture
- GitHub Pages sirf static frontend (`frontend/`) serve karta hai. PHP/MySQL backend GitHub Pages par nahi chalta.
- PHP hosting par `backend/` upload karein. API endpoint aam tor par `https://api.YOURDOMAIN.com/api/index.php` hoga.
- Domain abhi na ho to hosting ka temporary domain/subdomain use karein. GitHub Pages URL ko CORS allow-list mein add karein.

## Hosting requirements
- PHP 8.1+ (recommended 8.2/8.3), PDO MySQL, mbstring, JSON, OpenSSL, ZipArchive.
- MySQL 8+ ya MariaDB 10.5+, HTTPS/SSL, phpMyAdmin, cron, private backup directory.
- Upload limits aur storage apne product images ke mutabiq rakhein.

## Database import — exactly this order
phpMyAdmin mein apni empty database select karke ye files aik aik karke import karein:
1. `backend/database/schema.sql`
2. `backend/database/marketplace_modules.sql`
3. `backend/database/operations_upgrade.sql`
4. `backend/database/advanced_modules.sql`
5. `backend/database/completion_modules.sql`

Har file ko sirf aik martaba import karein. Agar import error aaye to agla SQL import na karein; error ka exact text save karein aur database backup/clean reinstall se recover karein. `ADD COLUMN IF NOT EXISTS` jaisi syntax ke liye supported MySQL/MariaDB version zaroor check karein.

## Backend configuration
1. `backend/config.example.php` ki copy `backend/config.php` banayein.
2. Database host/name/user/password, `allowed_origins`, `app_url`, aur random `install_key` set karein.
3. `config.php` ko GitHub par kabhi commit na karein. Is file ko public web se access nahi hona chahiye.
4. `backup_dir` ko `public_html` se bahar private writable folder par set karein.
5. `backend/` ke contents hosting par upload karein; API path `/api/index.php` hona chahiye.
6. `php create_owner.php "Owner Name" "owner@example.com" "A-Long-Unique-Password"` sirf aik martaba CLI/SSH se chalayein. Script ko foran delete karein.

## Frontend + GitHub Pages
1. GitHub repository `sa341920-droid/sa341920-droid.github.io` kholein.
2. `frontend/` ke ANDAR ka tamam content repository root mein upload karein (frontend folder ko nested root folder na banayein).
3. `frontend/config.js` mein API base ko exact backend API directory par set karein, example: `https://api.example.com/api/` (trailing slash rakhein).
4. `backend/config.php` ke `allowed_origins` mein exact GitHub Pages origin add karein, example: `https://sa341920-droid.github.io`. Origin mein repository path ya trailing slash na dein.
5. GitHub Pages settings mein deployment branch/folder select karein aur HTTPS enforce karein.

## Checkout and payments
- COD order flow available hai.
- Bank Transfer option order create karta hai; payment ko Owner/Admin ko bank statement/receipt se manually verify karna hoga. Abhi automated bank reconciliation nahi.
- JazzCash/Easypaisa options abhi selection/recording only hain. Real payment tab tak enable na karein jab tak merchant onboarding, signed request generation, server-side signature verification, idempotent webhook/callback, refund handling aur sandbox/live tests complete na hon. Frontend success message ko payment proof na samjhein.
- Courier booking/tracking ke liye courier merchant account, API docs/keys, webhook verification aur live test shipments required hain.

## Security checklist before public launch
- HTTPS only; strong unique owner password; secrets environment variables/private config mein.
- `config.php`, SQL dumps, backup files aur logs web root se bahar.
- Owner account create karne ke baad installer script delete.
- Database least-privilege user; daily off-site encrypted backup; restore drill.
- Payment webhook signature verification, rate limits, CSRF/origin strategy, audit logs, staff role permissions aur independent security review complete karein.
- Real customer/payment data se pehle staging tests aur restore test karein.

## Smoke tests
Project root se `bash tests/smoke-static.sh` run karein. Ye PHP/JS syntax aur basic package checks hain; live database, browser checkout, payment gateways, courier aur production security ko certify nahi karta.
