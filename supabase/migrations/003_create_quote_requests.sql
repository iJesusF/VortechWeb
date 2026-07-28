-- Migration 003: Quote requests (public submissions)

CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  rfc TEXT,
  general_notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'converted', 'closed')),
  cart_snapshot JSONB NOT NULL DEFAULT '[]',
  converted_quote_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_number ON quote_requests(request_number);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);

CREATE TRIGGER set_quote_requests_updated_at
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
