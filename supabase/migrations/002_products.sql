-- Migration 002: Create products table
-- Description: Main products table with all catalog fields

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  specifications JSONB NOT NULL DEFAULT '{}',
  price_mode TEXT NOT NULL DEFAULT 'request_quote'
    CHECK (price_mode IN ('request_quote', 'fixed', 'from', 'hidden')),
  price DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'MXN',
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  whatsapp_message_override TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_slug ON public.products (slug);
CREATE INDEX idx_products_category ON public.products (category_id);
CREATE INDEX idx_products_active ON public.products (is_active, sort_order);
CREATE INDEX idx_products_featured ON public.products (is_featured, is_active);
CREATE INDEX idx_products_sku ON public.products (sku) WHERE sku IS NOT NULL;

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can read active products
CREATE POLICY "Public can view active products"
  ON public.products
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy: Authenticated users can view all products
CREATE POLICY "Authenticated users can view all products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update products
CREATE POLICY "Authenticated users can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (true);
