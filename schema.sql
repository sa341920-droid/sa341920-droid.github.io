CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('CUSTOMER','SELLER','ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT','PLACED','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURN_REQUESTED','REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('COD','ONLINE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('PENDING','PAID','FAILED','REFUNDED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE, phone VARCHAR(24), password_hash TEXT NOT NULL,
 role user_role NOT NULL DEFAULT 'CUSTOMER', is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS addresses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 recipient VARCHAR(120) NOT NULL, phone VARCHAR(24) NOT NULL, address_line TEXT NOT NULL,
 city VARCHAR(100) NOT NULL, province VARCHAR(100) NOT NULL, postal_code VARCHAR(20),
 is_default BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS categories (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL UNIQUE,
 slug VARCHAR(140) NOT NULL UNIQUE, description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
 category_id UUID REFERENCES categories(id) ON DELETE SET NULL, name VARCHAR(220) NOT NULL,
 slug VARCHAR(240) NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', price_pkr NUMERIC(12,2) NOT NULL CHECK(price_pkr>=0),
 compare_price_pkr NUMERIC(12,2) CHECK(compare_price_pkr>=0), stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),
 image_url TEXT, status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','ARCHIVED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_status_idx ON products(category_id,status);
CREATE INDEX IF NOT EXISTS products_search_idx ON products USING GIN(to_tsvector('english', name || ' ' || description));
CREATE TABLE IF NOT EXISTS orders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_number VARCHAR(32) NOT NULL UNIQUE,
 user_id UUID NOT NULL REFERENCES users(id), status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
 payment_method payment_method NOT NULL, payment_status payment_status NOT NULL DEFAULT 'PENDING',
 subtotal_pkr NUMERIC(12,2) NOT NULL, shipping_pkr NUMERIC(12,2) NOT NULL DEFAULT 0,
 total_pkr NUMERIC(12,2) NOT NULL, recipient VARCHAR(120) NOT NULL, phone VARCHAR(24) NOT NULL,
 address_line TEXT NOT NULL, city VARCHAR(100) NOT NULL, province VARCHAR(100) NOT NULL,
 payment_reference TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS order_items (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id UUID REFERENCES products(id) ON DELETE SET NULL, product_name VARCHAR(220) NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity>0), unit_price_pkr NUMERIC(12,2) NOT NULL CHECK(unit_price_pkr>=0),
 line_total_pkr NUMERIC(12,2) NOT NULL
);
CREATE TABLE IF NOT EXISTS payment_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), provider VARCHAR(80) NOT NULL,
 provider_event_id VARCHAR(200) NOT NULL UNIQUE, order_id UUID NOT NULL REFERENCES orders(id),
 event_type VARCHAR(120) NOT NULL, verified BOOLEAN NOT NULL DEFAULT FALSE,
 payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS return_requests (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id),
 user_id UUID NOT NULL REFERENCES users(id), reason TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS seller_profiles (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, store_name VARCHAR(180) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'PENDING', address TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Additive Royal Store modules (keeps the original marketplace tables intact)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'READY_FOR_DISPATCH';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'RETURNED';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'REFUNDED';
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_provider VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(120);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description VARCHAR(320);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;
CREATE TABLE IF NOT EXISTS product_variants(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,sku VARCHAR(100) UNIQUE,barcode VARCHAR(120),size VARCHAR(80),color VARCHAR(80),material VARCHAR(100),price_pkr NUMERIC(12,2) NOT NULL CHECK(price_pkr>=0),stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS wishlists(user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),PRIMARY KEY(user_id,product_id));
CREATE TABLE IF NOT EXISTS site_settings(key VARCHAR(120) PRIMARY KEY,value JSONB NOT NULL DEFAULT '{}'::jsonb,updated_by UUID REFERENCES users(id),updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS order_notes(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,user_id UUID REFERENCES users(id),note TEXT NOT NULL,private BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS payment_records(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,method VARCHAR(40) NOT NULL,status VARCHAR(30) NOT NULL DEFAULT 'PENDING',amount_pkr NUMERIC(12,2) NOT NULL,reference VARCHAR(200),verified_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS shipping_methods(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name VARCHAR(120) NOT NULL,kind VARCHAR(40) NOT NULL,charge_pkr NUMERIC(12,2) NOT NULL DEFAULT 0,free_over_pkr NUMERIC(12,2),enabled BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS return_cases(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),order_id UUID NOT NULL REFERENCES orders(id),user_id UUID REFERENCES users(id),kind VARCHAR(20) NOT NULL DEFAULT 'RETURN',reason TEXT NOT NULL,status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',resolution TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS notifications(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),user_id UUID REFERENCES users(id) ON DELETE CASCADE,channel VARCHAR(30) NOT NULL DEFAULT 'IN_APP',event VARCHAR(80) NOT NULL,payload JSONB NOT NULL DEFAULT '{}'::jsonb,status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',created_at TIMESTAMPTZ NOT NULL DEFAULT now(),sent_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS production_jobs(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),order_id UUID REFERENCES orders(id) ON DELETE SET NULL,customer_id UUID REFERENCES users(id),title VARCHAR(220) NOT NULL,printing_method VARCHAR(100),material VARCHAR(100),dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,positions JSONB NOT NULL DEFAULT '[]'::jsonb,quantity INTEGER NOT NULL DEFAULT 1,production_cost_pkr NUMERIC(12,2),quotation_pkr NUMERIC(12,2),design_url TEXT,approved BOOLEAN NOT NULL DEFAULT FALSE,status VARCHAR(40) NOT NULL DEFAULT 'QUOTATION',production_notes TEXT,quality_notes TEXT,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS production_files(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),job_id UUID NOT NULL REFERENCES production_jobs(id) ON DELETE CASCADE,owner_id UUID REFERENCES users(id),file_url TEXT NOT NULL,file_type VARCHAR(80) NOT NULL,is_private BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_logs(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),actor_id UUID REFERENCES users(id),action VARCHAR(120) NOT NULL,entity VARCHAR(120),entity_id VARCHAR(120),metadata JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS backup_runs(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),status VARCHAR(30) NOT NULL,storage_location TEXT,checksum VARCHAR(128),verified BOOLEAN NOT NULL DEFAULT FALSE,details JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS automation_runs(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),task VARCHAR(120) NOT NULL,status VARCHAR(30) NOT NULL,details JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS page_content(slug VARCHAR(120) PRIMARY KEY,title VARCHAR(220) NOT NULL,body TEXT NOT NULL,updated_by UUID REFERENCES users(id),updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS production_jobs_status_idx ON production_jobs(status);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS orders_tracking_idx ON orders(tracking_number);

-- Commercial operations extensions
CREATE TABLE IF NOT EXISTS coupons(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),code VARCHAR(40) NOT NULL UNIQUE,kind VARCHAR(16) NOT NULL CHECK(kind IN ('PERCENT','FIXED')),value NUMERIC(12,2) NOT NULL CHECK(value>0),min_order_pkr NUMERIC(12,2) NOT NULL DEFAULT 0,max_discount_pkr NUMERIC(12,2),starts_at TIMESTAMPTZ,ends_at TIMESTAMPTZ,usage_limit INTEGER,used_count INTEGER NOT NULL DEFAULT 0,enabled BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS coupon_redemptions(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),coupon_id UUID NOT NULL REFERENCES coupons(id),user_id UUID REFERENCES users(id),order_id UUID NOT NULL UNIQUE REFERENCES orders(id),discount_pkr NUMERIC(12,2) NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS product_reviews(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,order_id UUID REFERENCES orders(id),rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),title VARCHAR(160),body TEXT NOT NULL DEFAULT '',approved BOOLEAN NOT NULL DEFAULT FALSE,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),UNIQUE(product_id,user_id));
CREATE TABLE IF NOT EXISTS inventory_movements(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),product_id UUID NOT NULL REFERENCES products(id),actor_id UUID REFERENCES users(id),quantity_change INTEGER NOT NULL,reason VARCHAR(160) NOT NULL,reference VARCHAR(160),created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS support_tickets(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),user_id UUID REFERENCES users(id),email VARCHAR(255),subject VARCHAR(220) NOT NULL,message TEXT NOT NULL,status VARCHAR(24) NOT NULL DEFAULT 'OPEN',priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ticket_messages(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,sender_id UUID REFERENCES users(id),message TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS newsletter_subscribers(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),email VARCHAR(255) NOT NULL UNIQUE,is_active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS shipping_events(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,status VARCHAR(80) NOT NULL,description TEXT,location VARCHAR(180),event_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS seller_ledger(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),seller_id UUID NOT NULL REFERENCES users(id),order_id UUID REFERENCES orders(id),kind VARCHAR(30) NOT NULL,amount_pkr NUMERIC(12,2) NOT NULL,reference VARCHAR(180),created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS api_keys(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),name VARCHAR(120) NOT NULL,key_hash TEXT NOT NULL UNIQUE,last_used_at TIMESTAMPTZ,revoked_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS reviews_product_idx ON product_reviews(product_id,approved,created_at DESC);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status,created_at DESC);
CREATE INDEX IF NOT EXISTS shipping_events_order_idx ON shipping_events(order_id,event_at DESC);
INSERT INTO page_content(slug,title,body) VALUES
('about','About Royal Mobile And Printing Store','Royal Mobile And Printing Store serves customers in Faisalabad, Punjab, Pakistan. Contact support at 03040011041 for product and order assistance.'),
('privacy','Privacy Policy','We use customer information only to process orders, provide support, secure accounts and improve store operations. Do not submit payment card details through support forms. Contact 03040011041 for privacy requests.'),
('terms','Terms & Conditions','Product availability and prices may change. Orders are confirmed after store acceptance. Cash on Delivery is subject to delivery-area availability. Online payments are confirmed only after provider verification.'),
('returns-policy','Returns & Exchange Policy','Contact support at 03040011041 with your order number and reason. Return eligibility and timelines are assessed by the store. Items must be returned in their original condition unless faulty.'),
('shipping','Shipping & Delivery','Delivery time and charges depend on destination and courier availability. Tracking information is shown when the store records a shipment update.')
ON CONFLICT(slug) DO NOTHING;
