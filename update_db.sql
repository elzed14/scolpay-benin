-- Add customization columns to schools table
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#1e40af',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#60a5fa',
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS is_public_visible BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);

-- RLS Policy for public access
-- Allow anyone to read specific columns of public schools
DROP POLICY IF EXISTS "Public schools are viewable by everyone" ON schools;
CREATE POLICY "Public schools are viewable by everyone" 
ON schools FOR SELECT 
USING (is_public_visible = true);
