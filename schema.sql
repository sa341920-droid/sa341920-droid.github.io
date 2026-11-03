-- PostgreSQL schema starter for Royal Marketplace
CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, phone TEXT, role TEXT NOT NULL DEFAULT 'customer'
 CHECK (role IN ('customer','staff','admin')), created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS categories (
 id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
 id BIGSERIAL PRIMARY KEY, category_id BIGINT REFERENCES categories(id),
 name TEXT NOT NULL, slug TEXT UNIQUE, description TEXT, price NUMERIC(12,2) NOT NULL CHECK(price>=0),
 compare_at_price NUMERIC(12,2), sku TEXT UNIQUE, stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),
 status TEXT NOT NULL DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_images (
 id BIGSERIAL PRIMARY KEY, product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 image_url TEXT NOT NULL, alt_text TEXT, sort_order INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS addresses (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 recipient TEXT NOT NULL, phone TEXT NOT NULL, address_line TEXT NOT NULL, city TEXT NOT NULL,
 province TEXT, postal_code TEXT, is_default BOOLEAN DEFAULT false
);
CREATE TABLE IF NOT EXISTS orders (
 id BIGSERIAL PRIMARY KEY, order_number TEXT UNIQUE NOT NULL, user_id BIGINT REFERENCES users(id),
 customer_name TEXT NOT NULL, customer_email TEXT, customer_phone TEXT NOT NULL,
 shipping_address JSONB NOT NULL, subtotal NUMERIC(12,2) NOT NULL, delivery_fee NUMERIC(12,2) DEFAULT 0,
 discount NUMERIC(12,2) DEFAULT 0, total NUMERIC(12,2) NOT NULL,
 payment_method TEXT NOT NULL, payment_status TEXT DEFAULT 'pending',
 fulfillment_status TEXT DEFAULT 'received', created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
 id BIGSERIAL PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id BIGINT REFERENCES products(id), product_name TEXT NOT NULL,
 unit_price NUMERIC(12,2) NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0)
);
CREATE TABLE IF NOT EXISTS reviews (
 id BIGSERIAL PRIMARY KEY, product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
 user_id BIGINT REFERENCES users(id), rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 review_text TEXT, status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS coupons (
 id BIGSERIAL PRIMARY KEY, code TEXT UNIQUE NOT NULL, discount_type TEXT NOT NULL,
 discount_value NUMERIC(12,2) NOT NULL, starts_at TIMESTAMPTZ, expires_at TIMESTAMPTZ,
 usage_limit INTEGER, active BOOLEAN DEFAULT true
);
CREATE TABLE IF NOT EXISTS inventory_movements (
 id BIGSERIAL PRIMARY KEY, product_id BIGINT REFERENCES products(id), quantity_delta INTEGER NOT NULL,
 reason TEXT NOT NULL, reference TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS store_settings (
 key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT now()
);
