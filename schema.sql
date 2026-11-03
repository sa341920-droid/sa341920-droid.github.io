CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE user_role AS ENUM ('CUSTOMER','SELLER','ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT','PLACED','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURN_REQUESTED','REFUNDED');
CREATE TYPE payment_method AS ENUM ('COD','ONLINE');
CREATE TYPE payment_status AS ENUM ('PENDING','PAID','FAILED','REFUNDED');
CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE, phone VARCHAR(24), password_hash TEXT NOT NULL,
 role user_role NOT NULL DEFAULT 'CUSTOMER', is_active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE addresses (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 recipient VARCHAR(120) NOT NULL, phone VARCHAR(24) NOT NULL, address_line TEXT NOT NULL,
 city VARCHAR(100) NOT NULL, province VARCHAR(100) NOT NULL, postal_code VARCHAR(20),
 is_default BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE categories (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL UNIQUE,
 slug VARCHAR(140) NOT NULL UNIQUE, description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE products (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
 category_id UUID REFERENCES categories(id) ON DELETE SET NULL, name VARCHAR(220) NOT NULL,
 slug VARCHAR(240) NOT NULL UNIQUE, description TEXT NOT NULL DEFAULT '', price_pkr NUMERIC(12,2) NOT NULL CHECK(price_pkr>=0),
 compare_price_pkr NUMERIC(12,2) CHECK(compare_price_pkr>=0), stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),
 image_url TEXT, status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','ACTIVE','ARCHIVED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_status_idx ON products(category_id,status);
CREATE INDEX products_search_idx ON products USING GIN(to_tsvector('english', name || ' ' || description));
CREATE TABLE orders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_number VARCHAR(32) NOT NULL UNIQUE,
 user_id UUID NOT NULL REFERENCES users(id), status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
 payment_method payment_method NOT NULL, payment_status payment_status NOT NULL DEFAULT 'PENDING',
 subtotal_pkr NUMERIC(12,2) NOT NULL, shipping_pkr NUMERIC(12,2) NOT NULL DEFAULT 0,
 total_pkr NUMERIC(12,2) NOT NULL, recipient VARCHAR(120) NOT NULL, phone VARCHAR(24) NOT NULL,
 address_line TEXT NOT NULL, city VARCHAR(100) NOT NULL, province VARCHAR(100) NOT NULL,
 payment_reference TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_created_idx ON orders(user_id,created_at DESC);
CREATE TABLE order_items (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id UUID REFERENCES products(id) ON DELETE SET NULL, product_name VARCHAR(220) NOT NULL,
 quantity INTEGER NOT NULL CHECK(quantity>0), unit_price_pkr NUMERIC(12,2) NOT NULL CHECK(unit_price_pkr>=0),
 line_total_pkr NUMERIC(12,2) NOT NULL
);
CREATE TABLE payment_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), provider VARCHAR(80) NOT NULL,
 provider_event_id VARCHAR(200) NOT NULL UNIQUE, order_id UUID NOT NULL REFERENCES orders(id),
 event_type VARCHAR(120) NOT NULL, verified BOOLEAN NOT NULL DEFAULT FALSE,
 payload JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE return_requests (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id UUID NOT NULL REFERENCES orders(id),
 user_id UUID NOT NULL REFERENCES users(id), reason TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE seller_profiles (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, store_name VARCHAR(180) NOT NULL,
 status VARCHAR(30) NOT NULL DEFAULT 'PENDING', address TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
