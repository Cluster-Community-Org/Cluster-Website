-- ============================================================================
-- Migration: Add loader_enabled to public.homepage_config
-- Purpose: Allows admins to toggle the cinematic intro preloader from CMS
-- ============================================================================

ALTER TABLE public.homepage_config
ADD COLUMN IF NOT EXISTS loader_enabled BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN public.homepage_config.loader_enabled IS 'Controls whether the cinematic logo intro preloader is displayed on the public website';

