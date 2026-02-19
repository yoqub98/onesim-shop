-- =============================================
-- MIGRATION 007: Click Payment Infrastructure
-- =============================================
-- Purpose:
--   Prepare DB for Click SHOP-API (redirect/button) payment integration.
--   No card tokens are stored. Flow:
--     1. User clicks "Buy" → payment record created (INITIATED)
--     2. User redirected to Click payment page
--     3. Click POSTs Prepare (action=0) → we validate order, return prepare_id
--     4. Click deducts funds from user
--     5. Click POSTs Complete (action=1) → we confirm, immediately create eSIMAccess order
--     6. eSIMAccess webhook fires → order gets ICCID + QR code (COMPLETED)
--
-- Critical guarantees:
--   - QR code NEVER exposed until payment_status = 'COMPLETED'
--   - If eSIM order fails after confirmed payment → ESIM_ORDER_FAILED status
--     flags it for manual/automated reconciliation (never lose paid money silently)
--
-- Note: Click credentials not yet obtained. This is preparatory schema only.
-- =============================================

BEGIN;

-- =============================================
-- 1. PAYMENTS TABLE
--    One row per payment attempt (initial purchase OR top-up)
-- =============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- prepare_id is returned to Click as `merchant_prepare_id` in the Prepare response.
  -- Click echoes this exact value in the Complete callback → lets us look up this record.
  -- Auto-assigned on INSERT, so it's always ready even before Click calls Prepare.
  prepare_id BIGSERIAL UNIQUE NOT NULL,

  -- ---- User ----
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- ---- What is being paid for ----
  payment_type VARCHAR(30) NOT NULL DEFAULT 'INITIAL_PURCHASE',
  -- INITIAL_PURCHASE : first-time eSIM order
  -- TOPUP            : adding data/days to an existing eSIM

  -- Package details — denormalized so billing history is self-contained
  -- (package catalog can change; we preserve what the user actually bought)
  package_code     VARCHAR(100) NOT NULL,
  package_name     VARCHAR(255),
  country_code     VARCHAR(10),
  data_amount      VARCHAR(50),
  validity_days    INTEGER,
  price_uzs        DECIMAL(15, 2) NOT NULL,
  price_usd        DECIMAL(10, 4),

  -- ---- Click SHOP-API fields ----

  -- Sent to Click as `transaction_param` in the redirect URL.
  -- Must be unique per payment attempt. Format: pay_{timestamp}_{random}
  merchant_trans_id VARCHAR(100) UNIQUE NOT NULL,

  -- Click's own transaction ID, received in both Prepare and Complete callbacks.
  click_trans_id  BIGINT,

  -- Click payment document number — appears in the user's SMS confirmation.
  click_paydoc_id BIGINT,

  -- Error code from Click's Complete callback. 0 = success, negative = failure.
  click_error_code INTEGER,
  click_error_note TEXT,

  -- ---- Payment lifecycle status ----
  payment_status VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
  --
  -- INITIATED         → record created, redirect URL returned to frontend
  -- PREPARE_RECEIVED  → Click sent Prepare (action=0), signature verified, order valid
  -- PAYMENT_CONFIRMED → Click sent Complete (action=1) with error=0 (funds deducted)
  -- PAYMENT_FAILED    → Click sent Complete with error != 0 (payment declined/error)
  -- PAYMENT_CANCELLED → User cancelled at Click's page or session expired
  -- ESIM_ORDERING     → Calling eSIMAccess API to allocate eSIM (happens inside Complete handler)
  -- ESIM_ORDERED      → eSIMAccess accepted the order (waiting for allocation webhook)
  -- COMPLETED         → eSIM fully allocated: has ICCID, QR code, activation code
  -- ESIM_ORDER_FAILED → eSIMAccess API failed after payment confirmed — needs reconciliation!
  -- REFUND_PENDING    → Payment confirmed, eSIM delivery permanently failed, refund queued
  -- REFUNDED          → Reversed via Click Merchant API /payment/reversal endpoint

  -- ---- eSIMAccess order linkage ----
  -- Set after Complete callback successfully triggers eSIMAccess order creation.
  order_id            UUID REFERENCES orders(id) ON DELETE SET NULL,
  esim_order_no       VARCHAR(100),  -- orderNo from eSIMAccess API response
  esim_transaction_id VARCHAR(100) UNIQUE,  -- our txn ID sent to eSIMAccess (txn_{ts}_{random})
  esim_order_attempts SMALLINT DEFAULT 0,   -- retry counter for eSIMAccess order creation

  -- For TOPUP payments: points to the existing order being topped up
  topup_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,

  -- ---- Lifecycle timestamps ----
  initiated_at         TIMESTAMPTZ DEFAULT NOW(),
  prepare_received_at  TIMESTAMPTZ,
  payment_confirmed_at TIMESTAMPTZ,
  esim_ordered_at      TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,

  -- ---- Raw Click payloads (for debugging, disputes, compliance) ----
  raw_prepare_data  JSONB,  -- exact POST body Click sent for Prepare
  raw_complete_data JSONB,  -- exact POST body Click sent for Complete

  -- ---- Error tracking ----
  error_message TEXT,
  error_count   SMALLINT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payments IS
  'One row per Click payment attempt. Created when user initiates checkout. '
  'Updated through Click SHOP-API Prepare/Complete callbacks and eSIMAccess webhooks.';

COMMENT ON COLUMN payments.prepare_id IS
  'Sequential integer returned to Click in Prepare response as merchant_prepare_id. '
  'Click echoes this in Complete — used to look up this record on Complete callback.';

COMMENT ON COLUMN payments.merchant_trans_id IS
  'Our unique payment identifier sent to Click as transaction_param in the redirect URL. '
  'Also used as the primary lookup key for Prepare callback (before prepare_id is relevant).';

COMMENT ON COLUMN payments.payment_status IS
  'Full flow: INITIATED → PREPARE_RECEIVED → PAYMENT_CONFIRMED → ESIM_ORDERING → '
  'ESIM_ORDERED → COMPLETED. '
  'Failure paths: PAYMENT_FAILED, PAYMENT_CANCELLED, ESIM_ORDER_FAILED, REFUND_PENDING, REFUNDED.';

COMMENT ON COLUMN payments.esim_order_attempts IS
  'Tracks how many times we tried to call eSIMAccess after payment confirmed. '
  'Helps identify stuck payments for reconciliation.';

-- =============================================
-- 2. PAYMENT AUDIT LOG
--    Immutable event trail — never UPDATE, only INSERT.
--    Every Click callback + every eSIMAccess attempt is logged here.
-- =============================================

CREATE TABLE IF NOT EXISTS payment_audit_log (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,

  -- Denormalized — allows querying even if payment row is gone
  merchant_trans_id VARCHAR(100),

  event_type VARCHAR(100) NOT NULL,
  -- PAYMENT_INITIATED
  -- PREPARE_RECEIVED          → got Prepare POST from Click
  -- PREPARE_SIGN_FAILED       → MD5 signature mismatch on Prepare
  -- PREPARE_RESPONDED         → we sent response to Click's Prepare
  -- COMPLETE_RECEIVED         → got Complete POST from Click
  -- COMPLETE_SIGN_FAILED      → MD5 signature mismatch on Complete
  -- COMPLETE_RESPONDED        → we sent response to Click's Complete
  -- ESIM_ORDER_ATTEMPTED      → called eSIMAccess API
  -- ESIM_ORDER_SUCCESS        → eSIMAccess accepted the order
  -- ESIM_ORDER_FAILED         → eSIMAccess returned error
  -- ESIM_ALLOCATED            → eSIMAccess webhook received, ICCID + QR available
  -- REFUND_INITIATED          → called Click /payment/reversal
  -- REFUND_SUCCESS
  -- REFUND_FAILED
  -- ADMIN_STATUS_OVERRIDE     → admin manually changed payment_status

  click_action    SMALLINT,      -- 0 = Prepare, 1 = Complete, NULL = other
  click_trans_id  BIGINT,
  amount_uzs      DECIMAL(15, 2),
  click_error_code INTEGER,

  -- request_data: incoming payload from Click, or our outgoing payload to eSIMAccess
  -- response_data: our response to Click, or the response we received from eSIMAccess
  request_data  JSONB,
  response_data JSONB,

  actor VARCHAR(50) DEFAULT 'system',
  -- 'click_callback' → triggered by Click's POST to our endpoint
  -- 'user'           → triggered by user action on frontend
  -- 'system'         → automated background/webhook process
  -- 'admin'          → manual admin action

  ip_address INET,  -- for Click callbacks: their server IP; useful for security audit

  created_at TIMESTAMPTZ DEFAULT NOW()
  -- NO updated_at — this table is append-only
);

COMMENT ON TABLE payment_audit_log IS
  'Append-only audit trail. Never updated. '
  'Every Click callback, every eSIMAccess attempt, every status change is logged here.';

-- =============================================
-- 3. LINK ORDERS TABLE TO PAYMENTS
--    orders.payment_id → payments.id
--    NULL for legacy orders created before payment integration.
-- =============================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;

COMMENT ON COLUMN orders.payment_id IS
  'The Click payment that funded this eSIM order. '
  'NULL on legacy orders created before payment integration was added.';

-- =============================================
-- 4. INDEXES
-- =============================================

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON payments(user_id);

CREATE INDEX IF NOT EXISTS idx_payments_merchant_trans_id
  ON payments(merchant_trans_id);

CREATE INDEX IF NOT EXISTS idx_payments_prepare_id
  ON payments(prepare_id);

CREATE INDEX IF NOT EXISTS idx_payments_click_trans_id
  ON payments(click_trans_id)
  WHERE click_trans_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_payment_status
  ON payments(payment_status);

-- Admin: find all payments by status + recency
CREATE INDEX IF NOT EXISTS idx_payments_status_created
  ON payments(payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_order_id
  ON payments(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_topup_order_id
  ON payments(topup_order_id)
  WHERE topup_order_id IS NOT NULL;

-- User billing history (most common query)
CREATE INDEX IF NOT EXISTS idx_payments_user_created
  ON payments(user_id, created_at DESC);

-- Reconciliation: find stuck ESIM_ORDER_FAILED payments
CREATE INDEX IF NOT EXISTS idx_payments_esim_order_failed
  ON payments(payment_status, esim_order_attempts)
  WHERE payment_status IN ('ESIM_ORDER_FAILED', 'REFUND_PENDING', 'ESIM_ORDERED');

-- payment_audit_log
CREATE INDEX IF NOT EXISTS idx_audit_payment_id
  ON payment_audit_log(payment_id);

CREATE INDEX IF NOT EXISTS idx_audit_merchant_trans_id
  ON payment_audit_log(merchant_trans_id);

CREATE INDEX IF NOT EXISTS idx_audit_event_type
  ON payment_audit_log(event_type);

CREATE INDEX IF NOT EXISTS idx_audit_created_at
  ON payment_audit_log(created_at DESC);

-- orders (new FK column)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id
  ON orders(payment_id)
  WHERE payment_id IS NOT NULL;

-- =============================================
-- 5. UPDATED_AT TRIGGER FOR PAYMENTS
-- =============================================

-- Reuse the existing update_updated_at_column() function from migration 001.
CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. ROW LEVEL SECURITY
-- =============================================

-- --- payments ---
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can see their own payment records (for billing history page)
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Backend (service_role) has full access — needed for Click callbacks
CREATE POLICY "Service role full access on payments"
  ON payments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- --- payment_audit_log ---
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit entries (useful for support / self-service)
CREATE POLICY "Users can view own audit log entries"
  ON payment_audit_log FOR SELECT
  TO authenticated
  USING (
    payment_id IN (
      SELECT id FROM payments WHERE user_id = auth.uid()
    )
  );

-- Backend has full access
CREATE POLICY "Service role full access on audit log"
  ON payment_audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

GRANT SELECT ON payments TO authenticated;
GRANT ALL    ON payments TO service_role;
GRANT USAGE, SELECT ON SEQUENCE payments_prepare_id_seq TO service_role;

GRANT SELECT ON payment_audit_log TO authenticated;
GRANT ALL    ON payment_audit_log TO service_role;

-- =============================================
-- 8. HELPER FUNCTION: User billing history
--    Used for the "Billing / Payment History" page.
--    Returns a clean, safe view of the user's own payments.
-- =============================================

CREATE OR REPLACE FUNCTION get_user_billing_history(p_user_id UUID)
RETURNS TABLE (
  payment_id        UUID,
  merchant_trans_id VARCHAR,
  payment_type      VARCHAR,
  package_name      VARCHAR,
  country_code      VARCHAR,
  data_amount       VARCHAR,
  validity_days     INTEGER,
  price_uzs         DECIMAL,
  payment_status    VARCHAR,
  initiated_at      TIMESTAMPTZ,
  payment_confirmed_at TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  order_id          UUID,
  topup_order_id    UUID
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT
    id,
    merchant_trans_id,
    payment_type,
    package_name,
    country_code,
    data_amount,
    validity_days,
    price_uzs,
    payment_status,
    initiated_at,
    payment_confirmed_at,
    completed_at,
    order_id,
    topup_order_id
  FROM payments
  WHERE user_id = p_user_id
  ORDER BY created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_user_billing_history(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_billing_history(UUID) TO service_role;

COMMENT ON FUNCTION get_user_billing_history IS
  'Returns billing history for a user. Safe for authenticated users — returns only their own records.';

-- =============================================
-- 9. HELPER FUNCTION: Admin payment search
--    Find any payment by multiple identifiers.
--    Used in admin panel to track any customer's payment.
-- =============================================

CREATE OR REPLACE FUNCTION admin_find_payments(p_search TEXT)
RETURNS TABLE (
  payment_id           UUID,
  user_id              UUID,
  merchant_trans_id    VARCHAR,
  click_trans_id       BIGINT,
  payment_type         VARCHAR,
  package_name         VARCHAR,
  country_code         VARCHAR,
  data_amount          VARCHAR,
  price_uzs            DECIMAL,
  payment_status       VARCHAR,
  esim_order_no        VARCHAR,
  order_id             UUID,
  initiated_at         TIMESTAMPTZ,
  payment_confirmed_at TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  error_message        TEXT
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT
    id,
    user_id,
    merchant_trans_id,
    click_trans_id,
    payment_type,
    package_name,
    country_code,
    data_amount,
    price_uzs,
    payment_status,
    esim_order_no,
    order_id,
    initiated_at,
    payment_confirmed_at,
    completed_at,
    error_message
  FROM payments
  WHERE
    merchant_trans_id    ILIKE '%' || p_search || '%'
    OR esim_order_no     ILIKE '%' || p_search || '%'
    OR esim_transaction_id ILIKE '%' || p_search || '%'
    OR click_trans_id::TEXT = p_search
    OR prepare_id::TEXT   = p_search
    OR user_id::TEXT      = p_search
  ORDER BY created_at DESC
  LIMIT 100;
$$;

-- Only service_role (admin backend) can call this — never expose to authenticated role
GRANT EXECUTE ON FUNCTION admin_find_payments(TEXT) TO service_role;

COMMENT ON FUNCTION admin_find_payments IS
  'Admin-only. Search payments by merchant_trans_id, click_trans_id, '
  'esim_order_no, prepare_id, or user_id. Returns up to 100 results.';

-- =============================================
-- 10. HELPER FUNCTION: Get orders that need reconciliation
--     Payments where money was received but eSIM delivery failed.
--     Admin dashboard widget / automated reconciliation job.
-- =============================================

CREATE OR REPLACE FUNCTION get_payments_needing_reconciliation()
RETURNS TABLE (
  payment_id           UUID,
  user_id              UUID,
  merchant_trans_id    VARCHAR,
  price_uzs            DECIMAL,
  payment_status       VARCHAR,
  esim_order_attempts  SMALLINT,
  payment_confirmed_at TIMESTAMPTZ,
  error_message        TEXT,
  minutes_since_confirmed NUMERIC
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT
    id,
    user_id,
    merchant_trans_id,
    price_uzs,
    payment_status,
    esim_order_attempts,
    payment_confirmed_at,
    error_message,
    ROUND(EXTRACT(EPOCH FROM (NOW() - payment_confirmed_at)) / 60, 1)
  FROM payments
  WHERE payment_status IN ('ESIM_ORDER_FAILED', 'REFUND_PENDING', 'ESIM_ORDERED')
  ORDER BY payment_confirmed_at ASC;
$$;

GRANT EXECUTE ON FUNCTION get_payments_needing_reconciliation() TO service_role;

COMMENT ON FUNCTION get_payments_needing_reconciliation IS
  'Returns all payments where money was confirmed but eSIM delivery is stuck or failed. '
  'Used for admin reconciliation dashboard and automated retry jobs.';

COMMIT;
