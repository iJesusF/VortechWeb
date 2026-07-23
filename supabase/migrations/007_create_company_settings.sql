-- Migration 007: Company settings (singleton row)

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name TEXT NOT NULL DEFAULT 'VORTECH',
  trade_name TEXT NOT NULL DEFAULT 'VORTECH',
  rfc TEXT,
  address JSONB,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT,
  logo_url TEXT,
  currency TEXT NOT NULL DEFAULT 'MXN',
  default_validity_days INTEGER NOT NULL DEFAULT 15,
  default_terms TEXT,
  default_tax_rate NUMERIC(6,4) NOT NULL DEFAULT 0.16,
  default_withholding_rate NUMERIC(6,4) NOT NULL DEFAULT 0,
  tax_enabled BOOLEAN NOT NULL DEFAULT false,
  withholding_enabled BOOLEAN NOT NULL DEFAULT false,
  quote_prefix TEXT NOT NULL DEFAULT 'COT',
  next_quote_number INTEGER NOT NULL DEFAULT 1,
  pdf_footer TEXT,
  responsible_name TEXT,
  whatsapp TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default row if not exists
INSERT INTO company_settings (legal_name, trade_name, phone, email)
VALUES ('VORTECH', 'VORTECH', '+52 6861455822', 'ventas@vortech.mx')
ON CONFLICT DO NOTHING;
