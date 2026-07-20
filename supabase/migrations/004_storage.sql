-- Migration 004: Create storage bucket for product images
-- Description: Storage bucket with policies for product images

-- Create bucket (must be done via Supabase dashboard or API, this is documentation)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Note: Storage bucket creation and policies should be configured in the Supabase dashboard:
-- 1. Create a public bucket named "product-images"
-- 2. Add the following policies:

-- Policy: Anyone can view files (public bucket)
-- CREATE POLICY "Public read access" ON storage.objects
--   FOR SELECT TO anon, authenticated
--   USING (bucket_id = 'product-images');

-- Policy: Authenticated users can upload files
-- CREATE POLICY "Authenticated users can upload" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'product-images');

-- Policy: Authenticated users can update files
-- CREATE POLICY "Authenticated users can update" ON storage.objects
--   FOR UPDATE TO authenticated
--   USING (bucket_id = 'product-images');

-- Policy: Authenticated users can delete files
-- CREATE POLICY "Authenticated users can delete" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (bucket_id = 'product-images');
