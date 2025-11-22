-- Add smdp_status and order_usage columns to orders table
-- These fields track the SM-DP+ status and data usage from eSIMAccess API

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS smdp_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS order_usage INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN orders.smdp_status IS 'SM-DP+ status from eSIMAccess (RELEASED, ENABLED, DISABLED, DELETED)';
COMMENT ON COLUMN orders.order_usage IS 'Data usage in MB from eSIMAccess (updated every 2-3 hours)';
