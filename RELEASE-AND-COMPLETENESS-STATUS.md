# Royal Marketplace — current implementation and release status

## Implemented in this source package

- Customer storefront with catalogue, categories, search/sort, product pages, variants, wishlist, verified-buyer reviews and newsletter capture.
- Customer account panel: profile/password, address book, orders, order tracking, printable invoice, notifications, support, returns, seller application, printing requests and personal-data export.
- Checkout: guest/customer COD, server-side shipping-method calculation, coupon validation/redemption, row-locked inventory, stock ledger, request idempotency, and duplicate-line rejection.
- Owner Panel: products/categories/variants, orders/state transitions, COD receipt confirmation, seller/customer/review moderation, returns and optional restocking, shipping methods, coupons, inventory, support/replies, production, page/settings editor, audit, health, backup/automation/notification views.
- Variant-aware product selection/stock in customer checkout and POS; walk-in POS sale records; expense entries; paid-revenue-minus-expenses operational report; campaign drafts; seller ledger view.
- Security hardening: bcrypt, short-lived JWT with issuer/audience, active-account and current-role lookup on every request, admin authorization, Helmet/CSP, origin allow-list, rate limiting, zod validation, parameterized SQL, and audit/inventory history.
- Cloudflare Pages frontend config, API proxy rule, CI and deployment workflows, weekly Dependabot dependency update PRs, daily encrypted PostgreSQL backup workflow, restore test, and R2 upload steps.

## Verification completed in this workspace

- `npm test`: **17/17 tests passed**.
- JavaScript syntax checks passed for the server, security modules, storefront, Owner Panel, invoice, product detail and auxiliary page scripts.
- Duplicate Express method/path registrations are checked by a test.
- Public HTML is checked for inline scripts and inline event handlers; external scripts are used with a CSP.

These are source-level tests. No PostgreSQL server or production credentials were connected in this workspace, so migrations and database-backed flows were not run end-to-end.

## Not activated / still needs external access or further engineering

- No live deployment to Cloudflare, Vercel, Render or another host has been performed. `public/_redirects` still contains the API hostname placeholder until the actual deployed API URL is known.
- No live database has been provisioned or migrated in this session.
- Online payments/refunds: provider-specific API and cryptographic webhook adapter are not implemented. Payment success cannot be inferred from a browser redirect. COD remains available; POS receipts are owner-recorded.
- Email/SMS/WhatsApp: campaign drafts, tickets and notification queue exist, but outbound delivery adapters/workers are not connected.
- Courier booking, rate/ETA lookup, shipping labels and carrier webhooks are not connected; manual tracking is available.
- Private uploads, image storage, malware scanning, signed private links and media backup are not implemented; product images use image URLs.
- Seller payout execution, full staff permissions/MFA, formal tax/COGS/payroll accounting, 3D designer and production-grade exports are not complete.
- Daily backup requires GitHub secrets and an R2 bucket. It backs up PostgreSQL only; media objects are not included and the workflow does not yet record its result in the Owner Panel backup table.
- The default rate limiter is per-process/in-memory; production multi-instance deployments need a shared Redis/Valkey rate-limit store.
- No full end-to-end, penetration, load, slow-network, device compatibility or disaster-recovery certification has been run.

## Architecture

Cloudflare Pages serves the static storefront. `/api/*` is proxied to a Node/Express host. PostgreSQL is the system of record. Cloudflare Pages alone cannot execute this existing Express/PostgreSQL backend. The Cloudflare deployment workflow deliberately fails while the API hostname is a placeholder or the required GitHub secrets are absent.

## Production decision

This is a substantially expanded application source package, **not a live, production-certified store**. Keep online checkout disabled until the selected payment gateway adapter and signed webhook are tested. Configure database, domain, API host, Cloudflare, R2, and provider credentials in their respective account secret stores; never paste passwords or API keys into chat or source files.
