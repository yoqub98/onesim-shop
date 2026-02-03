-- Migration: Create user_favorites table
-- Description: This table stores user favorite eSIM packages
-- Created: 2026-02-03

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,

  -- Ensure a user can't favorite the same package twice
  UNIQUE(user_id, package_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_package_id ON user_favorites(package_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON user_favorites TO authenticated;

-- Add helpful comment
COMMENT ON TABLE user_favorites IS 'Stores user favorite eSIM packages';
COMMENT ON COLUMN user_favorites.user_id IS 'Reference to the user who favorited the package';
COMMENT ON COLUMN user_favorites.package_id IS 'The eSIM package ID (packageCode from API)';
COMMENT ON COLUMN user_favorites.created_at IS 'Timestamp when the package was favorited';
