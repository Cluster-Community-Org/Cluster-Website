-- ==============================================================================
-- CLUSTER Society: QR Studio & Scan Tracker Tables
-- Saves artistic QR codes, visual configurations, and real-time scan analytics
-- ==============================================================================

-- 1. Table for Saved QR Codes & Campaigns
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  tracking_url TEXT,
  track_scans BOOLEAN DEFAULT true,
  scans INT DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for instant lookup on public /r/:slug redirects
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON public.qr_codes (slug);

-- 2. Table for QR Studio Page Configuration (Singleton Row id=1)
CREATE TABLE IF NOT EXISTS public.qr_studio_config (
  id INT PRIMARY KEY DEFAULT 1,
  url TEXT DEFAULT 'https://cluster-club.vercel.app/',
  title TEXT DEFAULT 'Cluster Official QR',
  active_preset TEXT DEFAULT 'home',
  enable_tracking BOOLEAN DEFAULT true,
  custom_slug TEXT DEFAULT '',
  selected_theme_id TEXT DEFAULT 'cyber-silver',
  custom_bg TEXT DEFAULT '#ECEFF4',
  custom_light_dot TEXT DEFAULT '#C8CCD8',
  custom_dark_dot TEXT DEFAULT '#101014',
  custom_eye_outer TEXT DEFAULT '#ECEFF4',
  custom_eye_inner TEXT DEFAULT '#101014',
  custom_spark_color TEXT DEFAULT '#A3E635',
  artwork_mode TEXT DEFAULT 'cluster-emblem',
  artwork_scale INT DEFAULT 72,
  artwork_opacity INT DEFAULT 22,
  dot_scale INT DEFAULT 44,
  micro_dot_scale INT DEFAULT 12,
  glow_intensity INT DEFAULT 0,
  eye_style TEXT DEFAULT 'diamond',
  error_correction TEXT DEFAULT 'H',
  config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial default configuration row
INSERT INTO public.qr_studio_config (
  id, url, title, active_preset, enable_tracking, custom_slug,
  selected_theme_id, custom_bg, custom_light_dot, custom_dark_dot,
  custom_eye_outer, custom_eye_inner, custom_spark_color,
  artwork_mode, artwork_scale, artwork_opacity, dot_scale,
  micro_dot_scale, glow_intensity, eye_style, error_correction
)
VALUES (
  1,
  'https://cluster-club.vercel.app/',
  'Cluster Official QR',
  'home',
  true,
  '',
  'cyber-silver',
  '#ECEFF4',
  '#C8CCD8',
  '#101014',
  '#ECEFF4',
  '#101014',
  '#A3E635',
  'cluster-emblem',
  72,
  22,
  44,
  12,
  0,
  'diamond',
  'H'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Atomic RPC Function to Record Scans (Fast & Concurrent Safe)
CREATE OR REPLACE FUNCTION public.record_qr_scan(target_slug TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dest TEXT;
BEGIN
  UPDATE public.qr_codes
  SET scans = COALESCE(scans, 0) + 1,
      last_scanned_at = timezone('utc'::text, now()),
      updated_at = timezone('utc'::text, now())
  WHERE slug = target_slug
  RETURNING destination_url INTO dest;

  RETURN dest;
END;
$$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_studio_config ENABLE ROW LEVEL SECURITY;

-- Policies for public.qr_codes:
-- Public can read QR codes (required for /r/:slug redirects)
DROP POLICY IF EXISTS "Public read qr codes" ON public.qr_codes;
CREATE POLICY "Public read qr codes" ON public.qr_codes
  FOR SELECT
  USING (true);

-- Authenticated admins have full write access
DROP POLICY IF EXISTS "Admin insert qr codes" ON public.qr_codes;
CREATE POLICY "Admin insert qr codes" ON public.qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update qr codes" ON public.qr_codes;
CREATE POLICY "Admin update qr codes" ON public.qr_codes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin delete qr codes" ON public.qr_codes;
CREATE POLICY "Admin delete qr codes" ON public.qr_codes
  FOR DELETE
  TO authenticated
  USING (true);

-- Allow public scan increment if calling direct update fallback
DROP POLICY IF EXISTS "Public update scan count" ON public.qr_codes;
CREATE POLICY "Public update scan count" ON public.qr_codes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for public.qr_studio_config:
-- Public read config
DROP POLICY IF EXISTS "Public read qr config" ON public.qr_studio_config;
CREATE POLICY "Public read qr config" ON public.qr_studio_config
  FOR SELECT
  USING (true);

-- Authenticated admin update config
DROP POLICY IF EXISTS "Admin update qr config" ON public.qr_studio_config;
CREATE POLICY "Admin update qr config" ON public.qr_studio_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Enable Supabase Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_studio_config;

