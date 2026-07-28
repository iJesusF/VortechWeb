-- Migration 010: Connect clients, quotes, quote items, events, and consecutive folios.
-- Incremental and non-destructive. Existing rows are not modified except when an
-- authenticated administrator explicitly creates or updates a quotation.

CREATE OR REPLACE FUNCTION public.create_quote_with_items(
  _client_id UUID,
  _client JSONB,
  _request_id UUID,
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
  _items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  settings_row public.company_settings%ROWTYPE;
  resolved_client_id UUID := _client_id;
  created_quote public.quotes%ROWTYPE;
  generated_quote_number TEXT;
  generated_public_token TEXT;
  item JSONB;
  item_type TEXT;
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

  IF _valid_until < _issue_date THEN
    RAISE EXCEPTION 'The validity date cannot precede the issue date';
  END IF;

  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'At least one quote item is required';
  END IF;

  IF resolved_client_id IS NULL THEN
    IF _client IS NULL
      OR NULLIF(BTRIM(_client->>'business_name'), '') IS NULL
      OR NULLIF(BTRIM(_client->>'contact_name'), '') IS NULL
      OR NULLIF(BTRIM(_client->>'email'), '') IS NULL
      OR NULLIF(BTRIM(_client->>'phone'), '') IS NULL
    THEN
      RAISE EXCEPTION 'Complete client information is required';
    END IF;

    INSERT INTO public.clients (
      client_type,
      business_name,
      contact_name,
      email,
      phone,
      rfc,
      tax_regime,
      cfdi_use,
      fiscal_zip_code,
      billing_address,
      shipping_address,
      notes,
      is_active
    )
    VALUES (
      COALESCE(NULLIF(_client->>'client_type', ''), 'company'),
      BTRIM(_client->>'business_name'),
      BTRIM(_client->>'contact_name'),
      LOWER(BTRIM(_client->>'email')),
      BTRIM(_client->>'phone'),
      NULLIF(UPPER(BTRIM(_client->>'rfc')), ''),
      NULLIF(BTRIM(_client->>'tax_regime'), ''),
      NULLIF(BTRIM(_client->>'cfdi_use'), ''),
      NULLIF(BTRIM(_client->>'fiscal_zip_code'), ''),
      _client->'billing_address',
      _client->'shipping_address',
      NULLIF(BTRIM(_client->>'notes'), ''),
      true
    )
    RETURNING id INTO resolved_client_id;
  ELSIF NOT EXISTS (
    SELECT 1
    FROM public.clients
    WHERE id = resolved_client_id
      AND is_active = true
  ) THEN
    RAISE EXCEPTION 'The selected client does not exist or is inactive';
  END IF;

  SELECT *
  INTO settings_row
  FROM public.company_settings
  ORDER BY updated_at ASC, id ASC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.company_settings (
      legal_name,
      trade_name,
      phone,
      email,
      quote_prefix,
      next_quote_number
    )
    VALUES ('VORTECH', 'VORTECH', '', '', 'COT', 1)
    RETURNING * INTO settings_row;
  END IF;

  LOOP
    generated_quote_number :=
      COALESCE(NULLIF(UPPER(BTRIM(settings_row.quote_prefix)), ''), 'COT')
      || '-'
      || LPAD(settings_row.next_quote_number::TEXT, 6, '0');

    EXIT WHEN NOT EXISTS (
      SELECT 1
      FROM public.quotes
      WHERE quote_number = generated_quote_number
    );

    settings_row.next_quote_number := settings_row.next_quote_number + 1;
  END LOOP;

  UPDATE public.company_settings
  SET next_quote_number = settings_row.next_quote_number + 1
  WHERE id = settings_row.id;

  generated_public_token :=
    REPLACE(uuid_generate_v4()::TEXT, '-', '')
    || REPLACE(uuid_generate_v4()::TEXT, '-', '');

  INSERT INTO public.quotes (
    quote_number,
    client_id,
    request_id,
    status,
    currency,
    issue_date,
    valid_until,
    subtotal,
    discount_total,
    shipping_total,
    tax_total,
    withholding_total,
    payment_fee_total,
    grand_total,
    notes,
    terms,
    internal_notes,
    public_token,
    accepted_at,
    rejected_at,
    created_by
  )
  VALUES (
    generated_quote_number,
    resolved_client_id,
    _request_id,
    _status,
    UPPER(_currency),
    _issue_date,
    _valid_until,
    _subtotal,
    _discount_total,
    _shipping_total,
    _tax_total,
    _withholding_total,
    _payment_fee_total,
    _grand_total,
    NULLIF(BTRIM(_notes), ''),
    NULLIF(BTRIM(_terms), ''),
    NULLIF(BTRIM(_internal_notes), ''),
    generated_public_token,
    CASE WHEN _status = 'accepted' THEN now() ELSE NULL END,
    CASE WHEN _status = 'rejected' THEN now() ELSE NULL END,
    auth.uid()
  )
  RETURNING * INTO created_quote;

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
      created_quote.id,
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
    created_quote.id,
    'created',
    jsonb_build_object(
      'status', created_quote.status,
      'request_id', created_quote.request_id,
      'created_by', auth.uid()
    )
  );

  IF _request_id IS NOT NULL THEN
    UPDATE public.quote_requests
    SET
      converted_quote_id = created_quote.id,
      status = 'converted'
    WHERE id = _request_id
      AND converted_quote_id IS NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'The request does not exist or was already converted';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'id', created_quote.id,
    'quote_number', created_quote.quote_number,
    'client_id', created_quote.client_id,
    'public_token', created_quote.public_token,
    'status', created_quote.status
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
    accepted_at = CASE
      WHEN _status = 'accepted' THEN COALESCE(accepted_at, now())
      ELSE accepted_at
    END,
    rejected_at = CASE
      WHEN _status = 'rejected' THEN COALESCE(rejected_at, now())
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
      || jsonb_build_object('status', updated_quote.status, 'changed_by', auth.uid())
  );

  RETURN jsonb_build_object(
    'id', updated_quote.id,
    'status', updated_quote.status,
    'accepted_at', updated_quote.accepted_at,
    'rejected_at', updated_quote.rejected_at,
    'updated_at', updated_quote.updated_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_quote_with_items(
  UUID, JSONB, UUID, TEXT, TEXT, DATE, DATE, NUMERIC, NUMERIC, NUMERIC,
  NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, JSONB
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.update_quote_status(UUID, TEXT, JSONB)
TO authenticated;
