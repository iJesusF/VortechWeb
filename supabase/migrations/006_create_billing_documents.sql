-- Migration 006: Billing documents (for future invoice provider integration)

CREATE TABLE IF NOT EXISTS billing_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  document_type TEXT NOT NULL DEFAULT 'invoice',
  pdf_url TEXT,
  xml_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_documents_quote ON billing_documents(quote_id);
CREATE INDEX IF NOT EXISTS idx_billing_documents_status ON billing_documents(status);

CREATE TRIGGER set_billing_documents_updated_at
  BEFORE UPDATE ON billing_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
