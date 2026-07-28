-- Migration 012: Quote revisions, approved version tracking, and document assets.
-- Incremental and non-destructive. Existing accepted quotes only receive their
-- current version as approved_version; no quote, item, or setting is removed.

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS approved_version INTEGER;

UPDATE public.quotes
SET approved_version = version
WHERE approved_version IS NULL
  AND status IN ('accepted', 'payment_pending', 'paid');

CREATE OR REPLACE FUNCTION public.sync_quote_approved_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (
    TG_OP = 'INSERT'
    OR OLD.status IS DISTINCT FROM 'accepted'
    OR NEW.approved_version IS NULL
  ) THEN
    NEW.approved_version := NEW.version;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_quote_approved_version_trigger
  ON public.quotes;

CREATE TRIGGER sync_quote_approved_version_trigger
  BEFORE INSERT OR UPDATE OF status, version ON public.quotes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_quote_approved_version();

ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS logo_storage_path TEXT;

CREATE TABLE IF NOT EXISTS public.quote_revisions (
  id UUID PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  change_notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quote_id, version)
);

CREATE INDEX IF NOT EXISTS idx_quote_revisions_quote
  ON public.quote_revisions(quote_id, version DESC);

ALTER TABLE public.quote_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access to quote revisions"
  ON public.quote_revisions;

CREATE POLICY "Admin full access to quote revisions"
  ON public.quote_revisions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'document-assets',
  'document-assets',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

UPDATE storage.buckets
SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg']
WHERE id = 'document-assets';

DROP POLICY IF EXISTS "Public can read document assets"
  ON storage.objects;

CREATE POLICY "Public can read document assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-assets');

DROP POLICY IF EXISTS "Admin can manage document assets"
  ON storage.objects;

CREATE POLICY "Admin can manage document assets"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'document-assets'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'document-assets'
    AND auth.role() = 'authenticated'
  );

CREATE OR REPLACE FUNCTION public.revise_quote_with_items(
  _quote_id UUID,
  _client_id UUID,
  _status TEXT,
  _currency TEXT,
  _issue_date DATE,
  _valid_until DATE,
  _subtotal NUMERIC,
  _discount_total NUMERIC,
  _shipping_total NUMERIC,
  _tax_total NUMERIC,
  _withholding_total NUMERIC,
  _payment_fee_total NUMERIC,
  _grand_total NUMERIC,
  _notes TEXT,
  _terms TEXT,
  _internal_notes TEXT,
  _change_notes TEXT,
  _items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  locked_quote public.quotes%ROWTYPE;
  updated_quote public.quotes%ROWTYPE;
  item JSONB;
  item_type TEXT;
  previous_snapshot JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _valid_until < _issue_date THEN
    RAISE EXCEPTION 'The validity date cannot precede the issue date';
  END IF;

  IF _status NOT IN (
    'draft', 'sent', 'viewed', 'accepted', 'rejected',
    'expired', 'cancelled', 'payment_pending', 'paid'
  ) THEN
    RAISE EXCEPTION 'Invalid quote status';
  END IF;

  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'At least one quote item is required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.clients
    WHERE id = _client_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'The selected client does not exist or is inactive';
  END IF;

  SELECT *
  INTO locked_quote
  FROM public.quotes
  WHERE id = _quote_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;

  SELECT jsonb_build_object(
    'quote', to_jsonb(locked_quote),
    'client', (
      SELECT to_jsonb(client_row)
      FROM public.clients AS client_row
      WHERE client_row.id = locked_quote.client_id
    ),
    'items', COALESCE(
      (
        SELECT jsonb_agg(to_jsonb(quote_item) ORDER BY quote_item.sort_order)
        FROM public.quote_items AS quote_item
        WHERE quote_item.quote_id = locked_quote.id
      ),
      '[]'::JSONB
    )
  )
  INTO previous_snapshot;

  INSERT INTO public.quote_revisions (
    quote_id,
    version,
    snapshot,
    change_notes,
    created_by
  )
  VALUES (
    locked_quote.id,
    locked_quote.version,
    previous_snapshot,
    NULLIF(BTRIM(_change_notes), ''),
    auth.uid()
  )
  ON CONFLICT (quote_id, version) DO NOTHING;

  UPDATE public.quotes
  SET
    version = locked_quote.version + 1,
    client_id = _client_id,
    status = _status,
    currency = UPPER(_currency),
    issue_date = _issue_date,
    valid_until = _valid_until,
    subtotal = _subtotal,
    discount_total = _discount_total,
    shipping_total = _shipping_total,
    tax_total = _tax_total,
    withholding_total = _withholding_total,
    payment_fee_total = _payment_fee_total,
    grand_total = _grand_total,
    notes = NULLIF(BTRIM(_notes), ''),
    terms = NULLIF(BTRIM(_terms), ''),
    internal_notes = NULLIF(BTRIM(_internal_notes), ''),
    accepted_at = CASE WHEN _status = 'accepted' THEN now() ELSE accepted_at END,
    rejected_at = CASE WHEN _status = 'rejected' THEN now() ELSE rejected_at END
  WHERE id = locked_quote.id
  RETURNING * INTO updated_quote;

  DELETE FROM public.quote_items
  WHERE quote_id = locked_quote.id;

  FOR item IN SELECT value FROM jsonb_array_elements(_items)
  LOOP
    item_type := COALESCE(NULLIF(item->>'item_type', ''), 'custom');
    IF item_type NOT IN ('catalog', 'custom') THEN
      RAISE EXCEPTION 'Invalid quote item type';
    END IF;

    INSERT INTO public.quote_items (
      quote_id,
      item_type,
      product_id,
      sku,
      name,
      description,
      quantity,
      unit,
      unit_price,
      discount_type,
      discount_value,
      tax_rate,
      withholding_rate,
      line_subtotal,
      line_total,
      sort_order
    )
    VALUES (
      updated_quote.id,
      item_type,
      NULLIF(item->>'product_id', '')::UUID,
      NULLIF(BTRIM(item->>'sku'), ''),
      BTRIM(item->>'name'),
      NULLIF(BTRIM(item->>'description'), ''),
      (item->>'quantity')::NUMERIC,
      COALESCE(NULLIF(BTRIM(item->>'unit'), ''), 'pieza'),
      (item->>'unit_price')::NUMERIC,
      COALESCE(NULLIF(item->>'discount_type', ''), 'none'),
      (item->>'discount_value')::NUMERIC,
      (item->>'tax_rate')::NUMERIC,
      (item->>'withholding_rate')::NUMERIC,
      (item->>'line_subtotal')::NUMERIC,
      (item->>'line_total')::NUMERIC,
      (item->>'sort_order')::INTEGER
    );
  END LOOP;

  INSERT INTO public.quote_events (quote_id, event_type, metadata)
  VALUES (
    updated_quote.id,
    'version_created',
    jsonb_build_object(
      'from_version', locked_quote.version,
      'to_version', updated_quote.version,
      'status', updated_quote.status,
      'change_notes', NULLIF(BTRIM(_change_notes), ''),
      'changed_by', auth.uid()
    )
  );

  RETURN jsonb_build_object(
    'id', updated_quote.id,
    'quote_number', updated_quote.quote_number,
    'version', updated_quote.version,
    'status', updated_quote.status,
    'approved_version', updated_quote.approved_version
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_quote_status(
  _quote_id UUID,
  _status TEXT,
  _metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  updated_quote public.quotes%ROWTYPE;
  event_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _status NOT IN (
    'draft', 'sent', 'viewed', 'accepted', 'rejected',
    'expired', 'cancelled', 'payment_pending', 'paid'
  ) THEN
    RAISE EXCEPTION 'Invalid quote status';
  END IF;

  UPDATE public.quotes
  SET
    status = _status,
    approved_version = CASE
      WHEN _status = 'accepted' THEN version
      ELSE approved_version
    END,
    accepted_at = CASE
      WHEN _status = 'accepted' THEN now()
      ELSE accepted_at
    END,
    rejected_at = CASE
      WHEN _status = 'rejected' THEN now()
      ELSE rejected_at
    END
  WHERE id = _quote_id
  RETURNING * INTO updated_quote;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;

  event_name := CASE _status
    WHEN 'sent' THEN 'sent'
    WHEN 'viewed' THEN 'viewed'
    WHEN 'accepted' THEN 'accepted'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'cancelled' THEN 'cancelled'
    WHEN 'paid' THEN 'marked_paid'
    ELSE 'edited'
  END;

  INSERT INTO public.quote_events (quote_id, event_type, metadata)
  VALUES (
    updated_quote.id,
    event_name,
    COALESCE(_metadata, '{}'::JSONB)
      || jsonb_build_object(
        'status', updated_quote.status,
        'version', updated_quote.version,
        'changed_by', auth.uid()
      )
  );

  RETURN jsonb_build_object(
    'id', updated_quote.id,
    'status', updated_quote.status,
    'version', updated_quote.version,
    'approved_version', updated_quote.approved_version,
    'accepted_at', updated_quote.accepted_at,
    'rejected_at', updated_quote.rejected_at,
    'updated_at', updated_quote.updated_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.revise_quote_with_items(
  UUID, UUID, TEXT, TEXT, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC,
  NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT, JSONB
) TO authenticated;
