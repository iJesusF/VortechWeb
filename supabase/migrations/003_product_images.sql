-- Migration 003: Create product_images table
-- Description: Images associated with products

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_product_images_product ON public.product_images (product_id, sort_order);
CREATE INDEX idx_product_images_cover ON public.product_images (product_id, is_cover) WHERE is_cover = true;

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can view images of active products
CREATE POLICY "Public can view images of active products"
  ON public.product_images
  FOR SELECT
  TO anon
  USING (
    product_id IN (SELECT id FROM public.products WHERE is_active = true)
  );

-- Policy: Authenticated users can view all images
CREATE POLICY "Authenticated users can view all images"
  ON public.product_images
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert images
CREATE POLICY "Authenticated users can insert images"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update images
CREATE POLICY "Authenticated users can update images"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete images"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (true);
