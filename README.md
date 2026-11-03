# Royal Marketplace — GitHub-ready storefront

A responsive e-commerce marketplace front-end inspired by familiar marketplace shopping patterns. This repository includes a product catalog, category browsing, search, sort, product detail modal, cart, wishlist, demo checkout, order history, and a browser-based demo admin panel.

## Quick start (GitHub Pages)
1. Extract this ZIP.
2. Upload the contents of this folder to the root of your GitHub repository (not the enclosing folder).
3. Commit the files.
4. In GitHub, open **Settings → Pages**.
5. Choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
6. Open the published URL after GitHub Pages finishes deploying.

## Important production notes
This is a working **front-end demo**, not a fully secured Amazon-scale backend. It stores demo cart, wishlist and orders in the current browser using `localStorage`. Admin access is not authenticated. Demo checkout does not process payments or send actual orders to a server.

Before accepting real customers/payments, integrate:
- A secure backend/API and database (for example, Supabase, Firebase, or your own server)
- Server-side authentication, password hashing, admin roles and authorization
- Payment gateway available for your business and region
- Shipping/courier APIs, order email/SMS notifications
- Server-side stock and order validation, logging, backups and privacy policy/terms

Never put secret API keys, database passwords, or payment credentials in GitHub Pages JavaScript.

## Included features
- Responsive homepage and category cards
- Product search, category filter and sorting
- Product details, star ratings, stock display
- Cart quantity changes/removal and subtotal
- Wishlist
- Demo checkout form and local order history
- Admin product add/delete and order overview
- Printing, sublimation and customized gift service section
- Newsletter demo signup
- Contact/location details shown in storefront

## Customize
Edit product data in `assets/js/app.js`. Update branding and colors in `assets/css/style.css` and contact details in `index.html`.
