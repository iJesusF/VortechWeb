-- Migration 005: Payment methods and sessions

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('gateway', 'bank_transfer')),
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  fee_type TEXT NOT NULL DEFAULT 'none' CHECK (fee_type IN ('none', 'fixed', 'percentage')),
  fee_value NUMERIC(10,4) NOT NULL DEFAULT 0,
  fee_paid_by TEXT NOT NULL DEFAULT 'seller' CHECK (fee_paid_by IN ('seller', 'customer')),
  public_instructions TEXT,
  private_configuration JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL,
  external_reference TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MXN',
  fee_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  checkout_url TEXT,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN (
    'created', 'pending', 'completed', 'failed', 'cancelled', 'expired'
  )),
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_quote ON payment_sessions(quote_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_reference ON payment_sessions(external_reference) WHERE external_reference IS NOT NULL;

CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_payment_sessions_updated_at
  BEFORE UPDATE ON payment_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
