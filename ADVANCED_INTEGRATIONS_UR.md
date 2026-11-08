# Advanced Modules & Live Integrations — Royal Market Place

## Included in this build
- 20 seeded theme presets (visual presets, not 20 separately art-directed 3D storefronts).
- Translation dictionary table for Urdu/English and further locales.
- Multiple product images and product variant/stock tables.
- Seller payout records, shipping zones, social post queue, marketing campaigns.
- 2FA code storage foundation, integration registry, webhook audit logs and email templates.
- Provider credential configuration examples via PHP-host environment variables.

## Import order
1. `schema.sql`
2. `marketplace_modules.sql`
3. `operations_upgrade.sql`
4. `advanced_modules.sql`

Run each SQL file once against the same MySQL database. Back up the database first. `ADD COLUMN IF NOT EXISTS` requires a MySQL version that supports it; if your host uses an older version, apply those two user-column additions manually only if absent.

## External integrations are not live until credentials, contracts and callbacks exist
The package does not contain merchant credentials, approved provider accounts, production webhook URLs, courier contracts, Meta app approval, WhatsApp templates, SMS credits, or SMTP credentials. Therefore JazzCash, Easypaisa, courier label/tracking, automated social publishing, WhatsApp/SMS/email delivery are NOT represented as live/working merely by adding configuration placeholders. Each provider adapter must be implemented against the merchant's current official API documentation, with signed callback verification, idempotency, retries, reconciliation and sandbox/live tests.

## Security/production checklist before public launch
- Serve the API only over HTTPS; set exact GitHub/custom-domain origins in `allowed_origins`.
- Keep `config.php`, database dumps, uploads and logs outside public web root; deny direct access to storage.
- Use a dedicated least-privilege database user and strong unique secrets from environment variables.
- Configure secure backup destination off-server and test restore to a separate database.
- Add rate limits/WAF, password reset flow, verified email/phone, actual TOTP/WebAuthn 2FA, staff permission enforcement, CSP and security headers.
- Validate all order prices/coupons/shipping server-side; implement payment state transitions only from verified signed webhooks.
- Test guest checkout policy, concurrency, inventory rollback, tax, refunds, seller settlement and accounting reconciliation.
- Run browser E2E tests on real hosting, supported PHP/MySQL versions and mobile devices.

## Current honest status
This remains an extensible implementation package, not a certified or fully production-ready marketplace. The new migration creates data foundations; it does not magically implement third-party provider APIs or a full accounting/legal/tax workflow. Static syntax checks do not prove database, browser, payment, courier or security correctness.
