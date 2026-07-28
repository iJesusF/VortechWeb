-- Migration 011: Fix UUID resolution in the quotation creation RPC.
--
-- Migration 010 was already applied in production with a restricted search_path.
-- Supabase installs uuid_generate_v4() in the extensions schema, so the existing
-- function cannot resolve it at runtime. Adding the managed extensions schema
-- fixes the deployed function without recreating tables or modifying data.

ALTER FUNCTION public.create_quote_with_items(
  UUID, JSONB, UUID, TEXT, TEXT, DATE, DATE, NUMERIC, NUMERIC, NUMERIC,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, JSONB
)
SET search_path = public, extensions, pg_temp;
