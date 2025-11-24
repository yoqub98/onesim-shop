-- Add short_url column to orders table for eSIM activation link

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS short_url TEXT;

-- Add comment
COMMENT ON COLUMN orders.short_url IS 'Short URL for eSIM activation from eSIMAccess API';
