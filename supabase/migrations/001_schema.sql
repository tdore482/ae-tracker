-- AE Tracker · Supabase Schema
-- Run this in the Supabase SQL Editor to set up all tables.

-- 1. COURIERS
CREATE TABLE IF NOT EXISTS couriers (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  passcode TEXT NOT NULL DEFAULT '0000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY,
  date DATE NOT NULL,
  customer TEXT NOT NULL DEFAULT 'Unknown',
  phone TEXT NOT NULL DEFAULT '—',
  location TEXT NOT NULL DEFAULT 'Campus',
  payment TEXT NOT NULL DEFAULT 'Mobile Money',
  courier_id BIGINT REFERENCES couriers(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_courier ON orders(courier_id);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PAYMENT METHODS
CREATE TABLE IF NOT EXISTS payment_methods (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SETTINGS (single-row table)
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  currency TEXT NOT NULL DEFAULT 'MK',
  branch TEXT NOT NULL DEFAULT 'Campus Branch',
  admin_name TEXT NOT NULL DEFAULT 'Admin',
  next_order_id BIGINT NOT NULL DEFAULT 26,
  admin_passcode TEXT NOT NULL DEFAULT '0000',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings row
INSERT INTO settings (id, currency, branch, admin_name, next_order_id, admin_passcode)
VALUES (1, 'MK', 'Campus Branch', 'Admin', 26, '0000')
ON CONFLICT (id) DO NOTHING;

-- 6. ROW LEVEL SECURITY
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Permissive policies (anonymous access allowed — suitable for internal tools)
CREATE POLICY "anon_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_couriers" ON couriers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_payment_methods" ON payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_settings" ON settings FOR ALL USING (true) WITH CHECK (true);
