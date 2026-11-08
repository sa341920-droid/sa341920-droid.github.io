# Royal Market Place — Expanded Build / Urdu Setup

## اس اپڈیٹ میں شامل
- Daraz-inspired responsive storefront: mobile, tablet, desktop.
- Category directory, search, sorting, price filters, Flash Sale section, catalog, custom-printing CTA, social links.
- Cart UI and API-connected customer register/login/COD order flow (when API is configured).
- Owner sign-in, dashboard summary, product/category creation, order list, store settings.
- Extended MySQL schema: variants/images, addresses, wishlist, reviews, coupons, promotions, order history, payments, shipments, suppliers, stock movements, purchase orders, expenses, staff permissions, audit logs, social account placeholders, CMS pages, backup logs, sellers, returns, comparisons, notifications.

## انسٹالیشن
1. `backend/database/schema.sql` پہلے import کریں۔
2. اس کے بعد `backend/database/marketplace_modules.sql` import کریں۔
3. `backend/config.example.php` کی copy بنا کر `backend/config.php` کریں؛ DB credentials اور allowed origins درست کریں۔ `config.php` کو GitHub پر commit نہ کریں۔
4. PHP hosting میں `backend/` اپلوڈ کریں؛ API URL مثال: `https://your-domain.com/api/` (اگر آپ کا host rewrite path مختلف ہے تو اسی کے مطابق URL دیں)۔
5. `frontend/config.js` میں `apiBase` کو اصل API endpoint سے بدلیں۔ GitHub Pages پر `frontend/` کے contents publish کریں۔
6. Owner account محفوظ طریقے سے بنائیں۔ ابتدائی `create_owner.php` کو صرف ایک مرتبہ استعمال کریں، کامیابی کے فوراً بعد اسے server سے delete کریں۔
7. HTTPS لازمی کریں؛ PHP 8.1+، MySQL 8+/MariaDB 10.5+ اور PDO MySQL فعال ہونا چاہیے۔

## لازمی نوٹ: کیا ابھی live نہیں؟
یہ ایک expanded implementation package اور integration foundation ہے، live merchant/courier/social/AI account نہیں۔ JazzCash، Easypaisa، courier، SMS، SMTP، Meta/TikTok، AI providers کے لیے اصل business accounts، credentials، approved callbacks/webhooks اور provider-specific integration/testing درکار ہے۔ موجودہ storefront demo products دکھا سکتا ہے اگر API بند ہو؛ اس حالت میں حقیقی آرڈر نہیں بنتا۔

## ابھی مکمل production workflows نہیں
POS checkout/receipt, accounting ledger & tax rules, multi-vendor settlement/commission payout, bulk Excel import/export, product image upload/storage, full CMS page editor, automated offsite backup restore, 2FA, rate limiting/WAF, shipping label purchase, live payment verification/webhooks, automated social publishing, AI agent actions, multilingual translation management اور end-to-end QA کو deployment کے بعد الگ مکمل اور test کرنا ہوگا۔ SQL tables یا menu labels کو ان workflows کی مکمل فعالیت نہ سمجھیں۔

## محفوظ deployment checklist
- Strong unique DB password اور install key رکھیں۔
- DB user کو صرف اسی database تک محدود کریں۔
- `config.php`, backups, logs, uploads کو public web سے باہر رکھیں۔
- PHP errors browser پر نہ دکھائیں؛ logs فعال رکھیں۔
- CORS میں صرف اپنی GitHub Pages اور custom domain origins رکھیں۔
- Daily encrypted backups اور restore test schedule کریں۔
- Payment webhook signatures verify کیے بغیر paid status مت لگائیں۔
- Production میں seeded/demo products اور test accounts ہٹا دیں۔
- Launch سے پہلے test orders, stock race conditions, access control, CSRF/CORS, mobile browsers اور checkout کو staging پر test کریں۔


## اس ریلیز میں حقیقی طور پر مزید فعال کیے گئے workflows
- POS sale API: stock lock، quantity validation، transaction، sale receipt number، stock movement record۔ Owner Panel میں basic POS screen موجود ہے۔
- Expense entry/list اور date-range sales/expense report۔ رپورٹ کا net figure مکمل accounting profit نہیں؛ اس میں COGS، taxes، fees اور delivery costs شامل نہیں۔
- CMS page create/list اور coupon create/list کے Owner Panel screens۔ Coupon checkout میں apply نہیں ہوتا، اس لیے ابھی live discount نہیں لگتا۔
- Customer wishlist، delivered order کے بعد review submission (moderation کے ساتھ)، return request اور admin return status۔
- Login failed-attempt throttling، logout token revocation۔
- CLI compressed database backup script؛ cron scheduling اور offsite backup خود hosting پر configure کرنا ہوگا۔

## باقی لازمی کام — اسے 100% production-ready نہ سمجھیں
1. JazzCash/Easypaisa: merchant onboarding، signed request/response، callback/webhook signature verification، duplicate callback protection، refund flow اور sandbox/live certification۔ موجودہ code میں live payment provider شامل نہیں۔
2. Courier: provider-specific rate quote، booking، label، cancellation، tracking webhook۔ صرف shipment database table ہونا courier integration نہیں۔
3. Accounting: double-entry posting automation، COGS valuation، tax configuration، reconciliation، trial balance، balance sheet، profit/loss validation۔ Ledger tables موجود ہیں مگر تمام transactions خودکار طور پر ledger میں post نہیں ہوتیں۔
4. POS: barcode scan UI، cash drawer/session close، receipt printing، returns/refunds at POS، offline queue۔ Basic POS sale screen/API ہے، مکمل retail POS نہیں۔
5. Seller marketplace: seller onboarding/KYC، product ownership permissions، commission calculation، settlement/payout، seller reports اور dispute workflow۔ Tables ہیں مگر مکمل multi-vendor workflow نہیں۔
6. Bulk Excel/CSV import/export، image upload/CDN processing، product variants کا مکمل CRUD، inventory purchase receiving، low-stock alerts۔
7. CMS کا public page renderer، full editor/media library، menus, banners, theme builder، 20 polished themes۔ ابھی صرف basic page CRUD اور storefront design موجود ہے؛ 20 مکمل themes نہیں۔
8. Social publishing: Meta/TikTok/Instagram OAuth، permissions، scheduled posts، media rules، analytics۔ صرف integration placeholders ہیں۔
9. AI agent: provider adapters، tool permissions، approval gates، usage limits، logs۔ صرف architecture/keys guidance ہے؛ AI agents connected نہیں۔
10. Authentication: email verification، password reset، optional 2FA، session/device management، CAPTCHA، WAF، stronger abuse controls۔
11. Backups: scheduled cron، encrypted offsite copy، retention policy، automated restore verification۔ اس package کا CLI script local gzip backup بناتا ہے، automatic schedule یا restore system نہیں۔
12. Internationalization/Urdu+English content management، SEO metadata editor، sitemap generation، structured data، accessibility and performance audits۔
13. Full test suite: actual MySQL import, PHP-host deployment, CORS, real browser checkout, payment callbacks, courier callbacks, load tests and independent security review۔ اس environment میں PHP lint اور JS syntax checks ہوئے؛ MySQL server/credentials موجود نہیں تھے، اس لیے DB integration test نہیں ہوا۔

## Deployment safety
- `operations_upgrade.sql` صرف ایک بار import کریں، schema.sql اور marketplace_modules.sql کے بعد۔
- `backup_dir` کو public_html سے باہر رکھیں۔ Cron مثال: روزانہ 02:30 پر `php /path/to/backend/cli/backup.php`۔
- `config.php` اور API keys کبھی GitHub میں commit نہ کریں۔
- `create_owner.php` کو CLI سے ایک مرتبہ چلائیں اور پھر server سے ہٹا دیں۔
- Public demo catalog حقیقی inventory نہیں؛ launch سے پہلے test data بدلیں۔

## اضافی ماڈیول ڈیٹا لیئر (نئی فائل)
`backend/database/completion_modules.sql` بھی باقی چار SQL فائلوں کے بعد import کریں۔ اس میں payment attempts، courier tracking events، seller verification/commission، double-entry journal lines، tax rules، notification queue، backup run history، import/export jobs، AI agent run approvals، security events، device sessions، SEO metadata اور media library کے لیے database structures شامل ہیں۔ یہ tables خودکار طور پر provider APIs، scheduled workers، admin screens یا accounting posting نہیں چلاتیں؛ ان کے لیے اگلے implementation اور live tests درکار ہیں۔

**SQL import order اب پانچ فائلیں ہیں:** `schema.sql` → `marketplace_modules.sql` → `operations_upgrade.sql` → `advanced_modules.sql` → `completion_modules.sql`.
