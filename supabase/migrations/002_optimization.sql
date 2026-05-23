-- AE Tracker · Performance Optimisation
-- Run this in the Supabase SQL Editor after 001_schema.sql.

-- 1. MISSING INDEXES
-- Customers: used in search (WHERE name/phone) and JOINs
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- Couriers: used in JOINs with orders and filtering by active status
CREATE INDEX IF NOT EXISTS idx_couriers_name ON couriers(name);
CREATE INDEX IF NOT EXISTS idx_couriers_active ON couriers(active);

-- Orders: composite index for date-range queries (common in revenue reports)
CREATE INDEX IF NOT EXISTS idx_orders_date_amount ON orders(date, amount);

-- Orders: index on payment for payment-breakdown aggregation
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment);

-- Orders: index on customer for search/customer-stats queries
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer);

-- 2. RPC FUNCTIONS

-- Dashboard metrics: total revenue, order count, status breakdown, avg/max/min
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON
LANGUAGE SQL
STABLE
AS $$
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(amount), 0),
    'order_count', COUNT(*)::integer,
    'in_transit', COUNT(*) FILTER (WHERE status = 'transit')::integer,
    'pending', COUNT(*) FILTER (WHERE status = 'pending')::integer,
    'delivered', COUNT(*) FILTER (WHERE status = 'delivered')::integer,
    'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled')::integer,
    'avg_order_value', COALESCE(ROUND(AVG(amount))::integer, 0),
    'max_amount', COALESCE(MAX(amount), 0),
    'min_amount', COALESCE(MIN(amount), 0)
  ) FROM orders;
$$;

-- Payment breakdown: totals per payment method
CREATE OR REPLACE FUNCTION get_payment_breakdown()
RETURNS JSON
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(json_agg(row ORDER BY row.total DESC), '[]'::json)
  FROM (
    SELECT
      json_build_object(
        'payment', payment,
        'total',   SUM(amount),
        'count',   COUNT(*)::integer
      ) AS row
    FROM orders
    GROUP BY payment
  ) sub;
$$;

-- Daily revenue for a given period (days=0 means all time)
CREATE OR REPLACE FUNCTION get_daily_revenue(days integer DEFAULT 7)
RETURNS JSON
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(json_agg(row ORDER BY row->>'date'), '[]'::json)
  FROM (
    SELECT
      json_build_object(
        'date',  date::text,
        'total', SUM(amount),
        'count', COUNT(*)::integer
      ) AS row
    FROM orders
    WHERE (days = 0 OR date >= CURRENT_DATE - days)
    GROUP BY date
  ) sub;
$$;

-- Courier stats: deliveries, revenue, in-transit, delivered counts
CREATE OR REPLACE FUNCTION get_courier_stats()
RETURNS JSON
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(json_agg(json_build_object(
    'id', c.id,
    'name', c.name,
    'deliveries', COUNT(o.id)::integer,
    'revenue', COALESCE(SUM(o.amount), 0),
    'in_transit', COUNT(o.id) FILTER (WHERE o.status = 'transit')::integer,
    'delivered', COUNT(o.id) FILTER (WHERE o.status = 'delivered')::integer
  ) ORDER BY COUNT(o.id) DESC), '[]'::json)
  FROM couriers c
  LEFT JOIN orders o ON o.courier_id = c.id
  GROUP BY c.id, c.name;
$$;