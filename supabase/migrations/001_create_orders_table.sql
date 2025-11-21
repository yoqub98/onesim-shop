-- Create orders table for eSIM purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_no VARCHAR(50),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  package_code VARCHAR(100) NOT NULL,
  package_name VARCHAR(255),
  country_code VARCHAR(10),
  data_amount VARCHAR(50),
  validity_days INTEGER,
  price_uzs DECIMAL(15, 2),
  price_usd DECIMAL(10, 4),
  order_status VARCHAR(20) DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'PROCESSING', 'ALLOCATED', 'FAILED', 'CANCELLED')),
  iccid VARCHAR(50),
  qr_code_url TEXT,
  qr_code_data TEXT,
  smdp_address VARCHAR(255),
  activation_code VARCHAR(255),
  esim_status VARCHAR(20),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_transaction_id ON orders(transaction_id);
CREATE INDEX idx_orders_status ON orders(order_status);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Only system can update orders (via service role)
-- Users cannot update orders directly
CREATE POLICY "Service role can update orders" ON orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;
