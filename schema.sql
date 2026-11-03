CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('CUSTOMER','SELLER','ADMIN'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT','PLACED','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURN_REQUESTED','REFUNDED','READY_FOR_DISPATCH','RETURNED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
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


-- Additive Royal Store feature foundation (keeps existing tables/data intact)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(80);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(80);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description VARCHAR(320);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_indexable BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS product_variants (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 sku VARCHAR(100) UNIQUE, barcode VARCHAR(100), size VARCHAR(80), color VARCHAR(80), material VARCHAR(100),
 price_pkr NUMERIC(12,2) NOT NULL CHECK(price_pkr>=0), stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),
 attributes JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wishlists (
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(user_id,product_id)
);
CREATE TABLE IF NOT EXISTS store_settings (
 setting_key VARCHAR(120) PRIMARY KEY, setting_value JSONB NOT NULL DEFAULT '{}'::jsonb,
 updated_by UUID REFERENCES users(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_notes (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 author_id UUID REFERENCES users(id), is_internal BOOLEAN NOT NULL DEFAULT FALSE, note TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS shipping_methods (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE,
 charge_pkr NUMERIC(12,2) NOT NULL DEFAULT 0, free_over_pkr NUMERIC(12,2), estimated_days INTEGER,
 regions JSONB NOT NULL DEFAULT '[]'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_records (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id),
 method VARCHAR(60) NOT NULL, amount_pkr NUMERIC(12,2) NOT NULL CHECK(amount_pkr>=0),
 status VARCHAR(30) NOT NULL DEFAULT 'PENDING', reference VARCHAR(200), verified_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notification_queue (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID REFERENCES users(id) ON DELETE SET NULL,
 channel VARCHAR(30) NOT NULL, destination TEXT, template VARCHAR(100) NOT NULL,
 payload JSONB NOT NULL DEFAULT '{}'::jsonb, status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
 attempts INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS production_jobs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
 product_id UUID REFERENCES products(id) ON DELETE SET NULL, customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
 reference_files JSONB NOT NULL DEFAULT '[]'::jsonb, approved_design_file TEXT, production_notes TEXT,
 printing_method VARCHAR(100), material VARCHAR(100), dimensions JSONB NOT NULL DEFAULT '{}'::jsonb,
 printing_positions JSONB NOT NULL DEFAULT '[]'::jsonb, quantity INTEGER NOT NULL DEFAULT 1,
 production_cost_pkr NUMERIC(12,2), quotation_pkr NUMERIC(12,2), design_approved BOOLEAN NOT NULL DEFAULT FALSE,
 status VARCHAR(40) NOT NULL DEFAULT 'REQUESTED', quality_control JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
 action VARCHAR(120) NOT NULL, entity_type VARCHAR(80), entity_id TEXT, metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 ip_address INET, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS backup_runs (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), status VARCHAR(30) NOT NULL,
 storage_location TEXT, checksum VARCHAR(128), validated BOOLEAN NOT NULL DEFAULT FALSE,
 details JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS system_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), severity VARCHAR(20) NOT NULL,
 component VARCHAR(100) NOT NULL, message TEXT NOT NULL, details JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS production_jobs_status_idx ON production_jobs(status,created_at DESC);
CREATE INDEX IF NOT EXISTS notification_queue_status_idx ON notification_queue(status,created_at);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);

-- New enum values are included in the initial type definition above for fresh installs.
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'READY_FOR_DISPATCH';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'RETURNED';
