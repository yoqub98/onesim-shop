-- Add missing columns to orders table
-- These columns are needed for proper eSIM status tracking and activation links

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS short_url TEXT,
ADD COLUMN IF NOT EXISTS smdp_status VARCHAR(50);

-- Add index for smdp_status for faster filtering
CREATE INDEX IF NOT EXISTS idx_orders_smdp_status ON orders(smdp_status);

-- Comment on columns
COMMENT ON COLUMN orders.short_url IS 'Short URL for quick eSIM activation';
COMMENT ON COLUMN orders.smdp_status IS 'SMDP server status (RELEASED, ENABLED, DELETED, etc.)';
