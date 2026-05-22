-- AE Tracker · Seed Data
-- Run this AFTER 001_schema.sql to populate initial data.

-- Couriers
INSERT INTO couriers (id, name, phone, active, passcode) VALUES
  (1, 'S''busiso', '265 888 000 001', true, '0000'),
  (2, 'Praise',   '265 888 000 002', true, '0000'),
  (3, 'Peter Kalua', '265 888 000 003', true, '0000')
ON CONFLICT (id) DO NOTHING;

-- Payment methods
INSERT INTO payment_methods (name) VALUES
  ('Mobile Money'),
  ('Cash'),
  ('Bank Transfer')
ON CONFLICT (name) DO NOTHING;

-- Orders
INSERT INTO orders (id, date, customer, phone, location, payment, courier_id, amount, status, notes) VALUES
  (1,  '2026-04-07', 'Unknown',              '—',                'Campus', 'Mobile Money',  1, 2100, 'delivered', ''),
  (2,  '2026-04-08', 'Unknown',              '265 885 390 222',  'Campus', 'Mobile Money',  1, 800,  'delivered', ''),
  (3,  '2026-04-08', 'Catherine Mkamanga',   '265 885 390 222',  'Campus', 'Mobile Money',  1, 800,  'delivered', ''),
  (4,  '2026-04-08', 'Unknown',              '—',                'Campus', 'Mobile Money',  1, 850,  'delivered', ''),
  (5,  '2026-04-09', 'Catherine Mkamanga',   '265 885 390 222',  'Campus', 'Mobile Money',  2, 900,  'delivered', ''),
  (6,  '2026-04-10', 'Catherine Mkamanga',   '265 885 390 222',  'Campus', 'Mobile Money',  2, 900,  'delivered', ''),
  (7,  '2026-04-12', 'Catherine Mkamanga',   '265 885 390 222',  'Campus', 'Mobile Money', NULL, 900,  'transit',   ''),
  (8,  '2026-04-13', 'Catherine Mkamanga',   '265 885 390 222',  'Campus', 'Mobile Money', NULL, 900,  'transit',   ''),
  (9,  '2026-04-13', 'Unknown',              '265 885 390 222',  'Campus', 'Mobile Money', NULL, 800,  'transit',   ''),
  (10, '2026-04-14', 'Unknown',              '—',                'Campus', 'Cash',          NULL, 1600, 'pending',   ''),
  (11, '2026-04-14', 'Unknown',              '—',                'Campus', 'Cash',          NULL, 850,  'pending',   ''),
  (12, '2026-04-14', 'Unknown',              '—',                'Campus', 'Cash',          NULL, 2500, 'pending',   ''),
  (13, '2026-04-15', 'Unknown',              '—',                'Campus', 'Cash',          NULL, 1700, 'pending',   ''),
  (14, '2026-04-15', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (15, '2026-04-15', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (16, '2026-04-16', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (17, '2026-04-17', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (18, '2026-04-17', 'Unknown',              '—',                'Campus', 'Cash',          NULL, 800,  'pending',   ''),
  (19, '2026-04-17', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (20, '2026-04-18', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (21, '2026-04-18', 'Unknown',              '—',                'Campus', 'Bank Transfer', NULL, 800,  'pending',   ''),
  (22, '2026-04-19', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 850,  'pending',   ''),
  (23, '2026-04-20', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (24, '2026-04-21', 'Unknown',              '—',                'Campus', 'Mobile Money',  NULL, 800,  'pending',   ''),
  (25, '2026-04-22', 'Unknown',              '—',                'Campus', 'Cash',          NULL, 2400, 'pending',   '')
ON CONFLICT (id) DO NOTHING;

-- Settings
INSERT INTO settings (id, currency, branch, admin_name, next_order_id, admin_passcode)
VALUES (1, 'MK', 'Campus Branch', 'Admin', 26, '0000')
ON CONFLICT (id) DO NOTHING;
