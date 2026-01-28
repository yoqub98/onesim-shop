-- Migration: Create Package Cache Tables
-- Purpose: Cache regional and global packages to avoid slow API fetches
-- Cache Duration: 1 week (prices remain stable)

-- Create regional packages cache table
CREATE TABLE IF NOT EXISTS cached_regional_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_code VARCHAR(50) NOT NULL,
  region_name VARCHAR(255) NOT NULL,
  packages JSONB NOT NULL,
  country_count INTEGER NOT NULL,
  package_count INTEGER NOT NULL,
  covered_countries JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create global packages cache table
CREATE TABLE IF NOT EXISTS cached_global_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_code VARCHAR(100) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  package_data JSONB NOT NULL,
  price DECIMAL(10, 4) NOT NULL,
  volume BIGINT NOT NULL,
  duration INTEGER NOT NULL,
  country_count INTEGER NOT NULL,
  covered_countries JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cache metadata table to track overall cache status
CREATE TABLE IF NOT EXISTS package_cache_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_type VARCHAR(50) NOT NULL UNIQUE, -- 'regional' or 'global'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  total_records INTEGER NOT NULL DEFAULT 0,
  is_valid BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_regional_region_code ON cached_regional_packages(region_code);
CREATE INDEX idx_regional_expires_at ON cached_regional_packages(expires_at);
CREATE INDEX idx_global_package_code ON cached_global_packages(package_code);
CREATE INDEX idx_global_slug ON cached_global_packages(slug);
CREATE INDEX idx_global_expires_at ON cached_global_packages(expires_at);
CREATE INDEX idx_metadata_cache_type ON package_cache_metadata(cache_type);
CREATE INDEX idx_metadata_expires_at ON package_cache_metadata(expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_package_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_regional_packages_updated_at
  BEFORE UPDATE ON cached_regional_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_package_cache_updated_at();

CREATE TRIGGER update_global_packages_updated_at
  BEFORE UPDATE ON cached_global_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_package_cache_updated_at();

CREATE TRIGGER update_cache_metadata_updated_at
  BEFORE UPDATE ON package_cache_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_package_cache_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE cached_regional_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_global_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_cache_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (read-only for authenticated and anon users)
CREATE POLICY "Anyone can read cached regional packages"
  ON cached_regional_packages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read cached global packages"
  ON cached_global_packages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read cache metadata"
  ON package_cache_metadata FOR SELECT
  USING (true);

-- Service role can insert/update (for cache refresh operations)
CREATE POLICY "Service role can insert regional packages"
  ON cached_regional_packages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update regional packages"
  ON cached_regional_packages FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete regional packages"
  ON cached_regional_packages FOR DELETE
  USING (true);

CREATE POLICY "Service role can insert global packages"
  ON cached_global_packages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update global packages"
  ON cached_global_packages FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete global packages"
  ON cached_global_packages FOR DELETE
  USING (true);

CREATE POLICY "Service role can insert cache metadata"
  ON package_cache_metadata FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update cache metadata"
  ON package_cache_metadata FOR UPDATE
  USING (true);

CREATE POLICY "Service role can delete cache metadata"
  ON package_cache_metadata FOR DELETE
  USING (true);

-- Insert initial metadata records
INSERT INTO package_cache_metadata (cache_type, total_records, is_valid, last_updated, expires_at)
VALUES
  ('regional', 0, false, NOW(), NOW()),
  ('global', 0, false, NOW(), NOW())
ON CONFLICT (cache_type) DO NOTHING;

-- Create function to check if cache is valid
CREATE OR REPLACE FUNCTION is_cache_valid(cache_type_param VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  cache_metadata RECORD;
BEGIN
  SELECT * INTO cache_metadata
  FROM package_cache_metadata
  WHERE cache_type = cache_type_param;

  IF cache_metadata IS NULL THEN
    RETURN false;
  END IF;

  RETURN cache_metadata.is_valid AND cache_metadata.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to invalidate cache
CREATE OR REPLACE FUNCTION invalidate_cache(cache_type_param VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE package_cache_metadata
  SET is_valid = false,
      updated_at = NOW()
  WHERE cache_type = cache_type_param;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE cached_regional_packages IS 'Caches processed regional package groups for 1 week';
COMMENT ON TABLE cached_global_packages IS 'Caches processed global packages for 1 week';
COMMENT ON TABLE package_cache_metadata IS 'Tracks cache validity and expiration for package caches';
