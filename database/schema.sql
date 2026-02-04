-- ============================================
-- ONESIM SHOP - DATABASE SCHEMA
-- Version: 1.0
-- Description: Complete schema for eSIM package management
-- ============================================

-- ============================================
-- MAIN PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS esim_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiers
  package_code VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Location/Coverage
  location_code VARCHAR(10) NOT NULL,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('country', 'regional', 'global')),
  covered_countries JSONB,

  -- Package Details
  data_volume BIGINT NOT NULL,
  data_gb DECIMAL(10,2) GENERATED ALWAYS AS (data_volume::decimal / 1073741824) STORED,
  duration INTEGER NOT NULL,
  duration_unit VARCHAR(10) DEFAULT 'DAY',
  speed VARCHAR(50),

  -- Pricing (USD cents * 100)
  api_price INTEGER NOT NULL,
  api_price_usd DECIMAL(10,2) GENERATED ALWAYS AS (api_price::decimal / 10000) STORED,

  -- Margin Management
  default_margin_percent INTEGER DEFAULT 50,
  custom_margin_percent INTEGER,
  effective_margin_percent INTEGER GENERATED ALWAYS AS (COALESCE(custom_margin_percent, default_margin_percent)) STORED,

  -- Final Price with margin
  final_price_usd DECIMAL(10,2) GENERATED ALWAYS AS (
    (api_price::decimal / 10000) * (1 + COALESCE(custom_margin_percent, default_margin_percent)::decimal / 100)
  ) STORED,

  -- Technical
  sms_status INTEGER DEFAULT 0,
  data_type INTEGER,
  active_type INTEGER,
  ip_export VARCHAR(100),
  fup_policy TEXT,
  support_topup_type INTEGER,
  unused_valid_time INTEGER,

  -- Raw data
  location_network_list JSONB NOT NULL,
  retail_price INTEGER,
  currency_code VARCHAR(10) DEFAULT 'USD',

  -- Business Logic
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  popularity_score INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,

  -- Sync
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  price_last_updated_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_packages_location_code ON esim_packages(location_code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_packages_location_type ON esim_packages(location_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON esim_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON esim_packages(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_packages_popularity ON esim_packages(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_packages_price ON esim_packages(final_price_usd);
CREATE INDEX IF NOT EXISTS idx_packages_data_gb ON esim_packages(data_gb);
CREATE INDEX IF NOT EXISTS idx_packages_slug ON esim_packages(slug);
CREATE INDEX IF NOT EXISTS idx_packages_search ON esim_packages USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- MARGIN OVERRIDES
-- ============================================
CREATE TABLE IF NOT EXISTS margin_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('country', 'regional', 'global')),
  location_code VARCHAR(10),
  margin_percent INTEGER NOT NULL,
  reason TEXT,
  created_by UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(override_type, location_code)
);

-- ============================================
-- PACKAGE OPERATORS (Normalized)
-- ============================================
CREATE TABLE IF NOT EXISTS package_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code VARCHAR(50) NOT NULL REFERENCES esim_packages(package_code) ON DELETE CASCADE,
  location_code VARCHAR(10) NOT NULL,
  location_name TEXT NOT NULL,
  operator_name VARCHAR(100) NOT NULL,
  network_type VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_code, location_code, operator_name)
);

CREATE INDEX IF NOT EXISTS idx_operators_package ON package_operators(package_code);
CREATE INDEX IF NOT EXISTS idx_operators_location ON package_operators(location_code);

-- ============================================
-- PRICE CHANGE HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS package_price_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code VARCHAR(50) NOT NULL REFERENCES esim_packages(package_code) ON DELETE CASCADE,
  old_price INTEGER,
  new_price INTEGER,
  old_price_usd DECIMAL(10,2),
  new_price_usd DECIMAL(10,2),
  change_amount INTEGER,
  change_percent DECIMAL(5,2),
  change_source VARCHAR(50) DEFAULT 'price_sync',
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_changes_package ON package_price_changes(package_code);
CREATE INDEX IF NOT EXISTS idx_price_changes_date ON package_price_changes(changed_at DESC);

-- ============================================
-- PRICE SYNC LOG
-- ============================================
CREATE TABLE IF NOT EXISTS price_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_started_at TIMESTAMPTZ NOT NULL,
  sync_completed_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'partial', 'running')),
  total_changes_detected INTEGER DEFAULT 0,
  packages_updated INTEGER DEFAULT 0,
  packages_added INTEGER DEFAULT 0,
  packages_removed INTEGER DEFAULT 0,
  error_message TEXT,
  changes_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_log_date ON price_sync_log(sync_started_at DESC);

-- ============================================
-- PACKAGE VIEWS (Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS package_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code VARCHAR(50) NOT NULL REFERENCES esim_packages(package_code) ON DELETE CASCADE,
  user_id UUID,
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country_code VARCHAR(10),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_views_package ON package_views(package_code);
CREATE INDEX IF NOT EXISTS idx_views_date ON package_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_views_user ON package_views(user_id) WHERE user_id IS NOT NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_packages_updated_at ON esim_packages;
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON esim_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_margin_overrides_updated_at ON margin_overrides;
CREATE TRIGGER update_margin_overrides_updated_at BEFORE UPDATE ON margin_overrides
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto increment view count
CREATE OR REPLACE FUNCTION increment_package_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE esim_packages
  SET view_count = view_count + 1
  WHERE package_code = NEW.package_code;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS increment_view_count ON package_views;
CREATE TRIGGER increment_view_count AFTER INSERT ON package_views
FOR EACH ROW EXECUTE FUNCTION increment_package_view_count();
