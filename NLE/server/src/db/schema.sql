-- =============================================================================
-- The Decor Party (TDP) - Supabase (PostgreSQL) Database Schema
-- Run this script in the Supabase SQL Editor to initialize all tables & indexes.
-- =============================================================================

-- Enable standard UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    password_hash TEXT DEFAULT '',
    google_id TEXT,
    photo_url TEXT DEFAULT '',
    gender TEXT DEFAULT '',
    date_of_birth TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    country TEXT DEFAULT '',
    pincode TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
    permissions TEXT[] DEFAULT '{}',
    reset_password_token TEXT,
    reset_password_expires TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    name TEXT NOT NULL UNIQUE,
    slug TEXT,
    image TEXT DEFAULT '',
    order_num INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    subcategories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(order_num);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    name TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    category_name TEXT DEFAULT '',
    subcategory TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10, 2),
    description TEXT DEFAULT '',
    inclusions TEXT[] DEFAULT '{}',
    image TEXT NOT NULL,
    more_images TEXT[] DEFAULT '{}',
    badge TEXT,
    badge_color TEXT DEFAULT 'purple' CHECK (badge_color IN ('purple', 'pink', 'gold', 'green')),
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    order_count INTEGER DEFAULT 0,
    add_ons_inline JSONB DEFAULT '[]'::jsonb,
    activities_inline JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_order ON products(active, order_count DESC, created_at DESC);

-- 4. ADDONS
CREATE TABLE IF NOT EXISTS addons (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image TEXT DEFAULT '',
    description TEXT DEFAULT '',
    category TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PRODUCT ADDONS JUNCTION
CREATE TABLE IF NOT EXISTS product_addons (
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    addon_id TEXT REFERENCES addons(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, addon_id)
);

-- 6. ACTIVITIES
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    order_number TEXT NOT NULL UNIQUE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    customer_id TEXT,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    category_name TEXT DEFAULT '',
    subcategory TEXT DEFAULT '',
    package_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    addon_total NUMERIC(10, 2) DEFAULT 0,
    activity_total NUMERIC(10, 2) DEFAULT 0,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    grand_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_method TEXT DEFAULT 'whatsapp' CHECK (payment_method IN ('razorpay', 'whatsapp')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
    order_status TEXT DEFAULT 'Pending',
    customer_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    product_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    booking_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    addons_snapshot JSONB DEFAULT '[]'::jsonb,
    activities_snapshot JSONB DEFAULT '[]'::jsonb,
    booking_details JSONB DEFAULT '[]'::jsonb,
    status_history JSONB DEFAULT '[]'::jsonb,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT UNIQUE, -- Indexed & Unique to prevent payment replay races!
    razorpay_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 8. CARTS
CREATE TABLE IF NOT EXISTS carts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, product_id)
);

-- 10. OTP TOKENS
CREATE TABLE IF NOT EXISTS otp_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    purpose TEXT DEFAULT 'login',
    attempts INTEGER DEFAULT 0,
    last_sent_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_tokens(phone);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_tokens(expires_at);

-- 11. ENQUIRIES
CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    message TEXT NOT NULL,
    event_type TEXT DEFAULT '',
    event_date TEXT DEFAULT '',
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'contact-form',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. SLIDERS
CREATE TABLE IF NOT EXISTS sliders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    legacy_mongo_id TEXT UNIQUE,
    image TEXT NOT NULL,
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    link TEXT DEFAULT '',
    order_num INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12b. GALLERY IMAGES
CREATE TABLE IF NOT EXISTS gallery_images (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    image_url TEXT NOT NULL,
    title TEXT DEFAULT '',
    category TEXT DEFAULT '',
    order_num INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(order_num);

-- 13. SITE CONTENT
CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. CHAT SESSIONS & MESSAGES (for AI Assistant)
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id TEXT PRIMARY KEY,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. ORDER COUNTER SEQUENCE
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- =============================================================================
-- 16. ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- =============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sliders ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Catalog & Public Content: Public read access
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read addons" ON addons;
CREATE POLICY "Public read addons" ON addons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product_addons" ON product_addons;
CREATE POLICY "Public read product_addons" ON product_addons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read activities" ON activities;
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read sliders" ON sliders;
CREATE POLICY "Public read sliders" ON sliders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read gallery_images" ON gallery_images;
CREATE POLICY "Public read gallery_images" ON gallery_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site_content" ON site_content;
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);

-- Realtime: the storefront subscribes to these tables directly (via
-- supabase-js on the client) for live catalog sync, replacing the old
-- server-held SSE stream which doesn't work on stateless serverless hosts.
-- Idempotent (unlike a plain ALTER PUBLICATION ADD TABLE, which errors and
-- aborts the rest of this script's transaction if re-run against a
-- publication that already has the table).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['products', 'categories', 'addons', 'activities', 'gallery_images', 'site_content']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END $$;

-- Public Contact & Enquiries: Public can insert enquiries
DROP POLICY IF EXISTS "Public insert enquiries" ON enquiries;
CREATE POLICY "Public insert enquiries" ON enquiries FOR INSERT WITH CHECK (true);

-- AI Chat Sessions: Allow session read/write
DROP POLICY IF EXISTS "Allow chat sessions access" ON chat_sessions;
CREATE POLICY "Allow chat sessions access" ON chat_sessions USING (true) WITH CHECK (true);

-- Carts: Authenticated users manage own cart
DROP POLICY IF EXISTS "Users manage own cart" ON carts;
CREATE POLICY "Users manage own cart" ON carts
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Wishlists: Authenticated users manage own wishlist
DROP POLICY IF EXISTS "Users manage own wishlist" ON wishlists;
CREATE POLICY "Users manage own wishlist" ON wishlists
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Orders: Customers can read own orders
DROP POLICY IF EXISTS "Users view own orders" ON orders;
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT
  USING (auth.uid()::text = user_id OR auth.jwt() ->> 'email' = customer_snapshot ->> 'email');

-- Note: The backend Express API connects using the Supabase Service Role key,
-- which automatically bypasses RLS to perform administrative, sync, and payment operations.

