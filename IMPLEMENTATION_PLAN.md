# Royal Mobile And Printing Store implementation plan

## Current repository status

The original project is a static GitHub Pages starter. An initial implementation commit introduced full-stack files but several contents landed at incorrect paths. This branch repairs those path errors and provides the first testable server-backed slice.

## Prioritized roadmap

1. **Foundation — implemented in this slice:** Express server, SQLite schema/bootstrap, API health, dynamic catalog/settings/themes, product CRUD, basic request intake, stock-checked order creation, responsive storefront and owner UI, 120 sample products, 20 theme palettes, API tests.
2. **Security — required before public admin use:** authentication/session management, server-side owner/staff roles, CSRF/rate limiting, security headers, private upload authorization, audit log, validation hardening.
3. **Commerce workflows:** customer accounts, checkout UX, order lifecycle, payment provider integration and webhook verification, shipping, refunds and returns.
4. **Operations:** inventory movements/suppliers, POS, expenses/accounting, reports, staff permissions and dashboard.
5. **Customer custom production:** validated/private uploads up to 20 files, quote workflow, approved requests to orders, design files/3D designer and tested exports.
6. **Integrations/automation:** secure AI provider proxy, platform-authorized social APIs and scheduler, notifications, promotion workflows, five-item draft generation.
7. **Reliability/deployment:** persistent host and database, encrypted independent backups and tested restore, migrations, monitoring, HTTPS, CI and release rollback.

No production completion is claimed. GitHub Pages does not run this backend. API credentials, host, authentication policy and actual integrations require configuration and additional work.
