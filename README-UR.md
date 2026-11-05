# Royal Mobile And Printing Store — PHP/MySQL project

یہ project PHP 8.2+ اور MySQL/MariaDB (PDO) کے لیے بنایا گیا ہے۔ یہ آپ کے پہلے GitHub project کے Node.js/PostgreSQL version سے الگ PHP build ہے۔

## Upload
1. اس ZIP کو extract کریں۔
2. GitHub repository میں موجود پرانے Node/PostgreSQL project کو پہلے اپنے کمپیوٹر پر backup کریں۔
3. اس PHP project کی تمام files repository root میں upload کریں؛ folders کا structure برقرار رکھیں۔
4. GitHub Pages PHP نہیں چلاتا۔ صرف GitHub پر upload کرنے سے PHP website live نہیں ہوگی۔
5. PHP/MySQL hosting پر files upload کریں، domain/subdomain کو hosting سے connect کریں اور SSL enable کریں۔

## Installation
1. Hosting میں PHP 8.2+, PDO MySQL, MySQL/MariaDB بنائیں۔
2. `uploads/` اور project root کو hosting کے مطابق writable کریں (config.local.php installer لکھتا ہے)۔
3. اپنی site کھولیں: `/installation/install.php`
4. DB details اور owner account درج کریں۔
5. Installer `database.sql` import، owner account create، `config.local.php` اور `installed.lock` بناتا ہے۔
6. Installer مکمل ہونے پر `/admin/` کھولیں۔

## موجودہ فعال بنیادی حصے
- Storefront home, catalog, category listing, product detail and search
- Customer registration/login/logout
- Session cart
- Checkout with transactional stock decrement and order creation
- COD and manual payment method selection
- Customer order history and order tracking lookup
- Admin dashboard, product creation, order status updates, customers list and basic CMS page creation
- MySQL schema for products, categories, images, variations, orders, payments, coupons, reviews, pages, blog, banners, settings, shipping, refunds, notifications and activity logs
- CSRF token checks, PDO prepared statements, password hashing, session cookie flags and security headers
- robots.txt and basic sitemap

## Important external setup / remaining modules
Real JazzCash/Easypaisa merchant APIs, bank reconciliation, card gateway, courier APIs, email/SMS/WhatsApp providers, tax rules, automatic refunds, media gallery, CSV/Excel bulk import/export, barcode label printing, full POS/purchase/supplier accounting, full page builder, language translation catalog, GA4/Search Console/Merchant Center IDs, scheduled database backups and advanced role permissions require provider credentials and additional integration/configuration. This build does not fake successful payments or carrier events. Manual payment options are only order payment labels; they do not confirm money received.

## Logo
Upload your original logo to `uploads/` from admin/hosting and connect it in the theme after confirming the actual logo file. No replacement logo has been invented.

## Security before launch
- Force HTTPS using your host's Let's Encrypt/AutoSSL feature.
- Ensure `config.local.php`, `database.sql`, `installed.lock`, `includes/`, and `logs/` are not publicly downloadable.
- Use a unique database user with least privileges.
- Set strong admin password; never commit secrets.
- Configure backups and test restore.
- Run PHP syntax checks and test checkout/admin on staging before taking real orders.
