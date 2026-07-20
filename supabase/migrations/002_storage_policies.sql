-- Migration: Storage bucket and policies for product images
-- Version: 002
-- Description: Creates the product-images storage bucket with appropriate access policies
-- NOTE: This migration must be run via Supabase SQL Editor as storage schema requires elevated privileges

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for product images
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Authenticated users can upload images
CREATE POLICY "product_images_auth_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Authenticated users can update images
CREATE POLICY "product_images_auth_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Authenticated users can delete images
CREATE POLICY "product_images_auth_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
