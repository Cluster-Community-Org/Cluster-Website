-- ============================================================================
-- Migration: Fix Homepage Config RLS Policy & Add Secure RPC Functions
-- Purpose: Allows admin CMS to reliably update homepage_config & loader_enabled
-- ============================================================================

-- 1. Ensure loader_enabled column exists
ALTER TABLE public.homepage_config
ADD COLUMN IF NOT EXISTS loader_enabled BOOLEAN DEFAULT TRUE;

-- 2. Update RLS policy to allow writing to homepage_config
DROP POLICY IF EXISTS "Admin homepage config update access" ON public.homepage_config;
DROP POLICY IF EXISTS "Public homepage config read access" ON public.homepage_config;
DROP POLICY IF EXISTS "Allow homepage config read" ON public.homepage_config;
DROP POLICY IF EXISTS "Allow homepage config write" ON public.homepage_config;

-- Read policy: Anyone can read homepage config
CREATE POLICY "Allow homepage config read" ON public.homepage_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write policy: Allow CMS updates
CREATE POLICY "Allow homepage config write" ON public.homepage_config
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Dedicated SECURITY DEFINER RPC to toggle loader_enabled directly
CREATE OR REPLACE FUNCTION public.set_homepage_loader_enabled(p_enabled BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.homepage_config
  SET loader_enabled = p_enabled,
      updated_at = timezone('utc'::text, now())
  WHERE id = 1;

  IF NOT FOUND THEN
    INSERT INTO public.homepage_config (id, loader_enabled, updated_at)
    VALUES (1, p_enabled, timezone('utc'::text, now()));
  END IF;

  RETURN p_enabled;
END;
$$;

-- 4. Dedicated SECURITY DEFINER RPC to update all homepage config fields
CREATE OR REPLACE FUNCTION public.update_homepage_config_all(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result RECORD;
BEGIN
  UPDATE public.homepage_config
  SET
    loader_enabled = COALESCE((p_payload->>'loader_enabled')::boolean, loader_enabled),
    banner_enabled = COALESCE((p_payload->>'banner_enabled')::boolean, banner_enabled),
    banner_text = COALESCE(p_payload->>'banner_text', banner_text),
    banner_link = COALESCE(p_payload->>'banner_link', banner_link),
    banner_link_text = COALESCE(p_payload->>'banner_link_text', banner_link_text),
    hero_headline = COALESCE(p_payload->>'hero_headline', hero_headline),
    hero_subtitle = COALESCE(p_payload->>'hero_subtitle', hero_subtitle),
    stats_enabled = COALESCE((p_payload->>'stats_enabled')::boolean, stats_enabled),
    applications_sheet_url = COALESCE(p_payload->>'applications_sheet_url', applications_sheet_url),
    applications_open = COALESCE((p_payload->>'applications_open')::boolean, applications_open),
    stats = COALESCE(p_payload->'stats', stats),
    updated_at = timezone('utc'::text, now())
  WHERE id = 1
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    INSERT INTO public.homepage_config (
      id,
      loader_enabled,
      banner_enabled,
      banner_text,
      banner_link,
      banner_link_text,
      hero_headline,
      hero_subtitle,
      stats_enabled,
      applications_sheet_url,
      applications_open,
      stats,
      updated_at
    )
    VALUES (
      1,
      COALESCE((p_payload->>'loader_enabled')::boolean, true),
      COALESCE((p_payload->>'banner_enabled')::boolean, true),
      COALESCE(p_payload->>'banner_text', 'Kickstart ''26 registrations are open for tech students.'),
      COALESCE(p_payload->>'banner_link', '/events'),
      COALESCE(p_payload->>'banner_link_text', 'See events'),
      COALESCE(p_payload->>'hero_headline', 'Find your people. Build together'),
      COALESCE(p_payload->>'hero_subtitle', 'A student community around compute.'),
      COALESCE((p_payload->>'stats_enabled')::boolean, false),
      COALESCE(p_payload->>'applications_sheet_url', ''),
      COALESCE((p_payload->>'applications_open')::boolean, true),
      COALESCE(p_payload->'stats', '[]'::jsonb),
      timezone('utc'::text, now())
    )
    RETURNING * INTO v_result;
  END IF;

  RETURN row_to_json(v_result)::jsonb;
END;
$$;
