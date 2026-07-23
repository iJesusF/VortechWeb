-- Migration 008: Row Level Security Policies
-- All tables protected. Only authenticated admin users can CRUD.
-- Public: read-only on categories/products (active only), insert on quote_requests.

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- PUBLIC POLICIES (anon and authenticated)
-- ═══════════════════════════════════════════════════════════════

-- Categories: public read (active only)
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Products: public read (active only)
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Quote Requests: public can INSERT only
CREATE POLICY "Public can create quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

-- Payment methods: public can read enabled methods (for public quote page)
CREATE POLICY "Public can read enabled payment methods"
  ON payment_methods FOR SELECT
  USING (is_enabled = true);

-- Company settings: public read (for public quote display)
CREATE POLICY "Public can read company settings"
  ON company_settings FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- ADMIN POLICIES (authenticated users only - all CRUD)
-- In a real setup, you'd restrict to specific admin roles.
-- ═══════════════════════════════════════════════════════════════

-- Categories: admin full access
CREATE POLICY "Admin full access to categories"
  ON categories FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Products: admin full access
CREATE POLICY "Admin full access to products"
  ON products FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Clients: admin only
CREATE POLICY "Admin full access to clients"
  ON clients FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Quote requests: admin can read and update
CREATE POLICY "Admin full access to quote requests"
  ON quote_requests FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Quotes: admin only
CREATE POLICY "Admin full access to quotes"
  ON quotes FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Quote items: admin only
CREATE POLICY "Admin full access to quote items"
  ON quote_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Quote events: admin only
CREATE POLICY "Admin full access to quote events"
  ON quote_events FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Payment methods: admin full access
CREATE POLICY "Admin full access to payment methods"
  ON payment_methods FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Payment sessions: admin only
CREATE POLICY "Admin full access to payment sessions"
  ON payment_sessions FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Billing documents: admin only
CREATE POLICY "Admin full access to billing documents"
  ON billing_documents FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Company settings: admin full access
CREATE POLICY "Admin full access to company settings"
  ON company_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
