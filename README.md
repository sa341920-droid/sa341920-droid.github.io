# Royal Market Place — GitHub Frontend + PHP/MySQL Backend

Brand: **Royal Market Place**  
Phone / WhatsApp: **03040011041**  
Location: **Faisalabad, Punjab, Pakistan**

This package contains an expanded responsive marketplace frontend, PHP API starter, owner panel, core ecommerce database and extended marketplace module schema. See `docs/DEPLOYMENT_UR.md`, `docs/FEATURE_AUDIT_AND_SETUP_UR.md` and `docs/ADVANCED_INTEGRATIONS_UR.md` before installation.

**Important:** It is not honestly describable as a 100% production-complete Daraz clone. External services require merchant/provider credentials. Advanced migration adds module foundations; it does not make provider APIs live. See the advanced integrations guide for exact limitations. Do not launch with real customer payments until provider webhooks, security review and end-to-end tests are completed.

Folders:
- `frontend/` — publish contents to GitHub Pages.
- `backend/` — upload to PHP hosting; configure private `config.php`.
- `backend/database/schema.sql` — core tables.
- `backend/database/marketplace_modules.sql` — extended module tables.
- `backend/database/operations_upgrade.sql` — POS, ledger foundations and operations.
- `backend/database/advanced_modules.sql` — themes, translations, variants, seller payouts and integration foundations.
- `backend/database/completion_modules.sql` — payment/courier/accounting/notification/security/import-export data foundations.
- `docs/` — setup, limitations and deployment checklist.
