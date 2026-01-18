-- Migration: Add consent tracking to profiles table
-- This migration adds columns to track user agreement to terms of service and privacy policy
-- Required for compliance with privacy policy and legal requirements

-- Add new columns to profiles table for consent tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- Add comment to explain columns
COMMENT ON COLUMN profiles.auth_provider IS 'Authentication provider used (email, google, etc.)';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';

-- Update the trigger function to handle new users with consent tracking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    phone,
    auth_provider,
    terms_accepted_at,
    privacy_accepted_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'auth_provider', 'email'),
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted_at')::timestamptz, NOW()),
    COALESCE((NEW.raw_user_meta_data->>'privacy_accepted_at')::timestamptz, NOW())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), profiles.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), profiles.last_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), profiles.phone),
    auth_provider = COALESCE(EXCLUDED.auth_provider, profiles.auth_provider),
    terms_accepted_at = COALESCE(EXCLUDED.terms_accepted_at, profiles.terms_accepted_at),
    privacy_accepted_at = COALESCE(EXCLUDED.privacy_accepted_at, profiles.privacy_accepted_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for querying by auth provider (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);

-- Backfill existing records with default consent timestamps
-- This assumes existing users agreed when they signed up
UPDATE profiles
SET
  auth_provider = COALESCE(auth_provider, 'email'),
  terms_accepted_at = COALESCE(terms_accepted_at, created_at),
  privacy_accepted_at = COALESCE(privacy_accepted_at, created_at)
WHERE terms_accepted_at IS NULL OR privacy_accepted_at IS NULL;
