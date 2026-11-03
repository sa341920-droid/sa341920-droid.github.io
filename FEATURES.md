# Marketplace feature map

This project is an expandable starter, not a deployed Amazon-scale service.

## Included in the downloadable project
- Storefront catalog, category filters, search, sort and product detail
- Browser demo cart, wishlist, checkout and order history
- Admin demo product CRUD and order overview
- Express API starter: product list/detail/create/delete and order create/list/status
- PostgreSQL relational schema starter
- Seller center, order tracking and returns/refunds demo pages
- README and deployment setup

## Production components that still require implementation/configuration
- Durable DB adapters and migrations; API currently has in-memory state
- Authentication/session management, password reset, MFA, verified email/phone
- Authorization policies and seller/admin roles on every protected endpoint
- Payment gateway and webhook signature validation; refunds and seller settlements
- Shipping carrier APIs, live shipment events and label generation
- Multi-vendor onboarding/KYC, seller storefront pages, commissions and payouts
- Search index, recommendations, inventory reservations, concurrency safety
- Upload storage/CDN, image processing, moderation and product variants
- Email/SMS/push notifications, audit trail, monitoring, backups and incident recovery
- Legal policy pages and compliance reviews for operating region

Do not use the demo for actual payments or sensitive customer information until these pieces are implemented and security-tested.
