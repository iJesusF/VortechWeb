-- Migration 004: Quotes, quote items, and quote events

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT NOT NULL UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  request_id UUID REFERENCES quote_requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'viewed', 'accepted', 'rejected',
    'expired', 'cancelled', 'payment_pending', 'paid'
  )),
  currency TEXT NOT NULL DEFAULT 'MXN',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  withholding_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_fee_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  terms TEXT,
  internal_notes TEXT,
  public_token TEXT NOT NULL UNIQUE,
  public_token_expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_token ON quotes(public_token);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON quotes(quote_number);

CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'catalog' CHECK (item_type IN ('catalog', 'custom')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sku TEXT,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(10,4) NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pieza',
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none', 'fixed', 'percentage')),
  discount_value NUMERIC(12,4) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
  withholding_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
  line_subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);

CREATE TABLE IF NOT EXISTS quote_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'edited', 'sent', 'viewed', 'accepted',
    'rejected', 'pdf_downloaded', 'payment_link_created',
    'marked_paid', 'cancelled', 'version_created'
  )),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON quote_events(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_events_type ON quote_events(event_type);

-- Triggers
CREATE TRIGGER set_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_quote_items_updated_at
  BEFORE UPDATE ON quote_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add FK from quote_requests.converted_quote_id to quotes
ALTER TABLE quote_requests
  ADD CONSTRAINT fk_quote_requests_converted_quote
  FOREIGN KEY (converted_quote_id) REFERENCES quotes(id)
  ON DELETE SET NULL;
