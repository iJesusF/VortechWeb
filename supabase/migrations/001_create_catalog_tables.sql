-- Migration: Create catalog tables for VORTECH product catalog
-- Version: 001
-- Description: Creates categories, products, and product_images tables with RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create price_mode enum
CREATE TYPE price_mode AS ENUM ('request_quote', 'fixed', 'from', 'hidden');

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  specifications JSONB NOT NULL DEFAULT '{}',
  price_mode price_mode NOT NULL DEFAULT 'request_quote',
  price DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'MXN',
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  whatsapp_message_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_sort ON products(sort_order);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_cover ON product_images(product_id, is_cover);
CREATE INDEX idx_product_images_sort ON product_images(product_id, sort_order);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- CATEGORIES POLICIES
-- Anonymous: read active categories only
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated: read all categories
CREATE POLICY "categories_auth_read" ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated: insert categories
CREATE POLICY "categories_auth_insert" ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated: update categories
CREATE POLICY "categories_auth_update" ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated: delete categories
CREATE POLICY "categories_auth_delete" ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- PRODUCTS POLICIES
-- Anonymous: read active products only
CREATE POLICY "products_public_read" ON products
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated: read all products
CREATE POLICY "products_auth_read" ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated: insert products
CREATE POLICY "products_auth_insert" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated: update products
CREATE POLICY "products_auth_update" ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated: delete products
CREATE POLICY "products_auth_delete" ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- PRODUCT IMAGES POLICIES
-- Anonymous: read images of active products only
CREATE POLICY "product_images_public_read" ON product_images
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
      AND products.is_active = true
    )
  );

-- Authenticated: read all images
CREATE POLICY "product_images_auth_read" ON product_images
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated: insert images
CREATE POLICY "product_images_auth_insert" ON product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated: update images
CREATE POLICY "product_images_auth_update" ON product_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated: delete images
CREATE POLICY "product_images_auth_delete" ON product_images
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Note: Run this in the Supabase dashboard SQL editor or via the Storage API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true);

-- Storage policies (run in Supabase dashboard):
-- CREATE POLICY "product_images_public_read" ON storage.objects
--   FOR SELECT TO anon
--   USING (bucket_id = 'product-images');
--
-- CREATE POLICY "product_images_auth_upload" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'product-images');
--
-- CREATE POLICY "product_images_auth_update" ON storage.objects
--   FOR UPDATE TO authenticated
--   USING (bucket_id = 'product-images');
--
-- CREATE POLICY "product_images_auth_delete" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'product-images');
