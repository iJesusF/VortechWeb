-- Migration 009: Restore catalog administration without replacing existing data
-- Execute manually after reviewing against the target Supabase project.
-- This migration is additive and idempotent. It does not delete or rewrite product data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS price_mode TEXT NOT NULL DEFAULT 'request_quote',
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'pieza',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_message_override TEXT,
  ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12,4) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(6,4) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_price_mode_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_price_mode_check
      CHECK (price_mode IN ('request_quote', 'fixed', 'from', 'hidden')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_discount_type_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_discount_type_check
      CHECK (discount_type IN ('none', 'fixed', 'percentage')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_discount_value_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_discount_value_check
      CHECK (discount_value >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_tax_rate_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_tax_rate_check
      CHECK (tax_rate >= 0 AND tax_rate <= 1) NOT VALID;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product
  ON public.product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_cover
  ON public.product_images(product_id, is_cover) WHERE is_cover = true;
CREATE INDEX IF NOT EXISTS idx_products_price_mode
  ON public.products(price_mode);
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON public.products(is_featured, is_active);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Consolidate known public product policies from both historical implementations.
-- Authenticated CRUD policies are intentionally left intact.
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Catalog public can read active products" ON public.products;
CREATE POLICY "Catalog public can read active products"
  ON public.products FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.categories
      WHERE categories.id = products.category_id
        AND categories.is_active = true
    )
  );

DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "Public can view images of active products" ON public.product_images;
DROP POLICY IF EXISTS "Catalog public can read active product images" ON public.product_images;
CREATE POLICY "Catalog public can read active product images"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.products
      JOIN public.categories ON categories.id = products.category_id
      WHERE products.id = product_images.product_id
        AND products.is_active = true
        AND categories.is_active = true
    )
  );

DROP POLICY IF EXISTS "Catalog admins can manage product images" ON public.product_images;
CREATE POLICY "Catalog admins can manage product images"
  ON public.product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Catalog public can read product image files" ON storage.objects;
CREATE POLICY "Catalog public can read product image files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1
      FROM public.products
      JOIN public.categories ON categories.id = products.category_id
      WHERE products.id::text = (storage.foldername(storage.objects.name))[1]
        AND products.is_active = true
        AND categories.is_active = true
    )
  );

DROP POLICY IF EXISTS "Catalog admins can upload product image files" ON storage.objects;
CREATE POLICY "Catalog admins can upload product image files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Catalog admins can update product image files" ON storage.objects;
CREATE POLICY "Catalog admins can update product image files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Catalog admins can delete product image files" ON storage.objects;
CREATE POLICY "Catalog admins can delete product image files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
