# Royal Mobile And Printing Store — Advanced PHP/MySQL

یہ PHP 8.2+ اور MySQL 8/MariaDB کے لیے ایک قابلِ توسیع کاروباری نظام ہے۔

## انسٹالیشن
1. ZIP extract کرکے تمام فائلیں PHP hosting کے `public_html` میں upload کریں۔
2. MySQL database اور database user بنائیں۔
3. `config/config.php` کو `config/config.sample.php` سے copy کرکے DB credentials درج کریں۔
4. Browser میں `/installation/` کھولیں، installer database schema اور ابتدائی admin بنائے گا۔
5. کامیابی کے بعد `installation/` directory حذف یا hosting پر بند کریں۔
6. HTTPS لازماً فعال کریں۔ `.htaccess` میں HTTPS redirect پہلے سے موجود ہے؛ development میں اسے عارضی طور پر بند کیا جا سکتا ہے۔

## ابتدائی لاگ اِن
Installer کے دوران اپنا admin email اور مضبوط password منتخب کریں۔ کوئی hard-coded default password نہیں۔

## شامل شدہ advanced modules
- Customer storefront, category/product search, product detail, cart, checkout, COD/manual bank transfer
- Customer registration/login, profile, address, order history
- Admin dashboard, products, variants, categories, stock movements, orders
- Coupons, reviews, CMS pages, banners, media uploads
- POS, suppliers, purchase receiving, expenses, sales/profit reports
- CSV product import/export, invoice printing, audit log
- Role-based access, CSRF, PDO prepared statements, password hashing, login throttling
- SEO metadata, sitemap, robots, JSON-LD product markup
- Urdu/English language switch hooks and PKR formatting
- Integration adapters that fail closed until valid provider credentials are configured

## Live integrations
JazzCash/Easypaisa merchant credentials, bank reconciliation, courier API keys, SMTP, WhatsApp Cloud API and SMS provider credentials are not included. Configure them in `config/integrations.php` and implement/test the provider-specific signing/webhook contract before enabling. The system never marks an online payment as paid merely because a browser redirects back.

## Hosting / GitHub
GitHub Pages only serves static files and cannot execute PHP or connect to MySQL. Upload this project to PHP/MySQL hosting. GitHub may be used as source backup. Never commit production secrets or database dumps.
