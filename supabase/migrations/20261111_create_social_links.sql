-- ==============================================================================
-- CLUSTER Community Society: Dedicated Social Links Table
-- Shared communication table between Main Website CMS & Standalone Linktree
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.social_links (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  url TEXT NOT NULL,
  icon_type TEXT DEFAULT 'globe',
  bg_class TEXT,
  badge TEXT,
  category TEXT DEFAULT 'Community',
  enabled BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public Read Access (Anyone can read active links on Linktree / Website)
DROP POLICY IF EXISTS "Public read social links" ON public.social_links;
CREATE POLICY "Public read social links" ON public.social_links
  FOR SELECT
  USING (true);

-- 4. Policy: Authenticated Admins have Full Write Access (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admin insert social links" ON public.social_links;
CREATE POLICY "Admin insert social links" ON public.social_links
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin update social links" ON public.social_links;
CREATE POLICY "Admin update social links" ON public.social_links
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin delete social links" ON public.social_links;
CREATE POLICY "Admin delete social links" ON public.social_links
  FOR DELETE
  TO authenticated
  USING (true);

-- 5. Enable Realtime Replication for the social_links table
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_links;

-- 6. Seed Default Society Channels
INSERT INTO public.social_links (id, title, subtitle, url, icon_type, bg_class, badge, category, enabled, is_highlighted, sort_order)
VALUES
  ('website', 'Official Website', 'Explore our DGX H200 cluster, circles & projects', 'https://clustersociety.tech', 'globe', 'bg-[#C6FF4D] text-black border-2 border-black hover:bg-[#b5f533]', 'Main Hub', 'Featured', true, true, 1),
  ('join', 'Apply for Membership (Recruitment 2026)', 'Join the Compute, Applied AI, or Crew circles', 'https://clustersociety.tech/join', 'rocket', 'bg-[#76B900] text-black border-2 border-black hover:bg-[#68a400]', 'Active', 'Recruitment', true, true, 2),
  ('events', 'Upcoming Events & Workshops', 'See hackathons, paper clubs & DGX compute bootcamps', 'https://clustersociety.tech/events', 'calendar', 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/15', 'Live', 'Community', true, false, 3),
  ('discord', 'Join our Discord', 'Chat with builders, find project teammates & get help', 'https://discord.gg/cluster', 'discord', 'bg-[#5865F2] text-white hover:bg-[#4752c4]', NULL, 'Community', true, false, 4),
  ('whatsapp', 'WhatsApp Community', 'Instant announcements, event updates & team channels', 'https://chat.whatsapp.com/cluster', 'whatsapp', 'bg-[#25D366] text-black font-semibold hover:bg-[#1ebd5a]', NULL, 'Community', true, false, 5),
  ('linkedin', 'LinkedIn Official', 'Follow club achievements, research papers & hiring alerts', 'https://www.linkedin.com/company/cluster-club-gu/', 'linkedin', 'bg-[#0A66C2] text-white hover:bg-[#084e96]', NULL, 'Social', true, false, 6),
  ('instagram', 'Instagram (@theclustercommunity)', 'Behind the scenes, reels, recaps & student spotlights', 'https://www.instagram.com/theclustercommunity', 'instagram', 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white hover:opacity-95', NULL, 'Social', true, false, 7),
  ('x', 'X (Formerly Twitter)', 'Quick announcements, tech takes & supercomputing updates', 'https://x.com/the_clusterclub', 'x', 'bg-black text-white border-2 border-white/20 hover:border-[#C6FF4D]', NULL, 'Social', true, false, 8),
  ('github', 'GitHub Organization', 'Open source repositories, research code & model weights', 'https://github.com/Cluster-Community-Org', 'github', 'bg-[#24292F] text-white border-2 border-white/20 hover:border-white/50', NULL, 'Code', true, false, 9),
  ('team', 'Meet the Leadership Team', 'Student directors and circle leads driving the club', 'https://clustersociety.tech/team', 'users', 'bg-white/5 text-[#F8F7F3] border border-white/10 hover:bg-white/10', NULL, 'About', true, false, 10)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  url = EXCLUDED.url,
  icon_type = EXCLUDED.icon_type,
  bg_class = EXCLUDED.bg_class,
  badge = EXCLUDED.badge,
  category = EXCLUDED.category,
  sort_order = EXCLUDED.sort_order;

