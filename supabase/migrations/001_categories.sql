-- Migration 001: Create categories table
-- Description: Categories for product organization

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_categories_slug ON public.categories (slug);
CREATE INDEX idx_categories_active ON public.categories (is_active, sort_order);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can read active categories
CREATE POLICY "Public can view active categories"
  ON public.categories
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Policy: Authenticated users can view all categories
CREATE POLICY "Authenticated users can view all categories"
  ON public.categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can insert categories
CREATE POLICY "Authenticated users can insert categories"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update categories
CREATE POLICY "Authenticated users can update categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete categories
CREATE POLICY "Authenticated users can delete categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (true);
