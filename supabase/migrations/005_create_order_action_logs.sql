-- =============================================
-- ORDER ACTION LOGS TABLE
-- Track all actions performed on orders (top-ups, cancellations, suspensions, etc.)
-- =============================================

-- 1. Create order_action_logs table
CREATE TABLE IF NOT EXISTS order_action_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action details
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
    'TOPUP',
    'CANCEL',
    'SUSPEND',
    'RESUME',
    'REVOKE'
  )),

  -- Top-up specific fields
  topup_package_code VARCHAR(100),
  topup_package_name VARCHAR(255),
  topup_transaction_id VARCHAR(100),
  topup_price_uzs DECIMAL(15, 2),
  topup_price_usd DECIMAL(10, 4),
  topup_data_added VARCHAR(50),
  topup_days_added INTEGER,

  -- General action data
  previous_state JSONB,  -- Store previous order state before action
  new_state JSONB,       -- Store new order state after action
  action_metadata JSONB, -- Any additional metadata

  -- Status tracking
  status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'PENDING')),
  error_message TEXT,

  -- API response data
  api_response JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_action_logs_order_id ON order_action_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON order_action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_action_type ON order_action_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON order_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_logs_transaction_id ON order_action_logs(topup_transaction_id) WHERE topup_transaction_id IS NOT NULL;

-- 3. Enable Row Level Security
ALTER TABLE order_action_logs ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Users can view own action logs" ON order_action_logs;
DROP POLICY IF EXISTS "Users can insert own action logs" ON order_action_logs;
DROP POLICY IF EXISTS "Service role can manage all action logs" ON order_action_logs;

-- 5. Create RLS Policies
-- Users can only view their own action logs
CREATE POLICY "Users can view own action logs" ON order_action_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own action logs
CREATE POLICY "Users can insert own action logs" ON order_action_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all action logs
CREATE POLICY "Service role can manage all action logs" ON order_action_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_action_logs_updated_at ON order_action_logs;
CREATE TRIGGER update_action_logs_updated_at
  BEFORE UPDATE ON order_action_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant permissions
GRANT ALL ON order_action_logs TO authenticated;
GRANT ALL ON order_action_logs TO service_role;

-- 8. Add comment
COMMENT ON TABLE order_action_logs IS 'Tracks all actions performed on orders including top-ups, cancellations, suspensions, etc.';

-- =============================================
-- HELPER FUNCTION: Get top-up count for an order
-- =============================================
CREATE OR REPLACE FUNCTION get_order_topup_count(p_order_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM order_action_logs
    WHERE order_id = p_order_id
      AND action_type = 'TOPUP'
      AND status = 'SUCCESS'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_order_topup_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_topup_count(UUID) TO service_role;

COMMENT ON FUNCTION get_order_topup_count IS 'Returns the number of successful top-ups for a given order';
