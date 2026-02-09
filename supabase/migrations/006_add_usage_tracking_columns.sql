-- Add usage tracking and activation date columns to orders table
-- These columns are needed for displaying live eSIM status and usage data

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_usage BIGINT,
ADD COLUMN IF NOT EXISTS total_volume BIGINT,
ADD COLUMN IF NOT EXISTS total_duration INTEGER,
ADD COLUMN IF NOT EXISTS activation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS installation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS esim_tran_no VARCHAR(50);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_esim_status ON orders(esim_status);
CREATE INDEX IF NOT EXISTS idx_orders_esim_tran_no ON orders(esim_tran_no);

-- Add comments for documentation
COMMENT ON COLUMN orders.order_usage IS 'Data usage in bytes from eSIM Access API';
COMMENT ON COLUMN orders.total_volume IS 'Total data volume in bytes from eSIM Access API';
COMMENT ON COLUMN orders.total_duration IS 'Total duration in days from eSIM Access API';
COMMENT ON COLUMN orders.activation_date IS 'Activation date and time from eSIM Access API';
COMMENT ON COLUMN orders.installation_date IS 'Installation date and time from eSIM Access API';
COMMENT ON COLUMN orders.expiry_date IS 'Expiry date and time from eSIM Access API';
COMMENT ON COLUMN orders.esim_tran_no IS 'eSIM transaction number from eSIM Access API';
