-- ==============================================================================
-- CLUSTER Society — 30-Day Seed Fixtures for Admin Analytics
-- Run in Supabase SQL Editor to populate test data.
-- Every row is tagged with meta = '{"seed": true}'.
--
-- One-line cleanup to purge seed data:
-- delete from public.page_events where meta->>'seed' = 'true';
-- ==============================================================================

do $$
declare
  d int;
  s int;
  v_day_ts timestamptz;
  v_session_id text;
  v_source text;
  v_device text;
  v_sources text[] := array['instagram', 'whatsapp', 'google', 'direct', 'linkedin', 'github'];
  v_devices text[] := array['mobile', 'desktop', 'tablet'];
  v_paths text[] := array['/', '/events', '/team', '/join', '/about'];
  v_sessions_per_day int;
begin
  -- Loop through the last 30 days
  for d in 0..29 loop
    v_day_ts := date_trunc('day', now() at time zone 'Asia/Kolkata') - (d || ' days')::interval + interval '10 hours';
    v_sessions_per_day := 15 + floor(random() * 25)::int; -- 15-40 sessions/day

    for s in 1..v_sessions_per_day loop
      v_session_id := 'seed_s' || d || '_' || s || '_' || substr(md5(random()::text), 1, 8);
      v_source := v_sources[1 + floor(random() * array_length(v_sources, 1))::int];
      v_device := v_devices[1 + floor(random() * array_length(v_devices, 1))::int];

      -- 1st pageview (always happens for a session)
      insert into public.page_events (
        created_at, session_id, event_type, path, source, device, is_bot, meta
      ) values (
        v_day_ts + (s * 40 || ' seconds')::interval,
        v_session_id,
        'pageview',
        '/',
        v_source,
        v_device,
        false,
        '{"seed": true}'::jsonb
      );

      -- 50% of sessions view a second page (events or join)
      if random() > 0.5 then
        insert into public.page_events (
          created_at, session_id, event_type, path, source, device, is_bot, meta
        ) values (
          v_day_ts + (s * 40 + 60 || ' seconds')::interval,
          v_session_id,
          'pageview',
          v_paths[2 + floor(random() * (array_length(v_paths, 1) - 1))::int],
          v_source,
          v_device,
          false,
          '{"seed": true}'::jsonb
        );
      end if;

      -- 20% of sessions view /join
      if random() > 0.8 then
        insert into public.page_events (
          created_at, session_id, event_type, path, source, device, is_bot, meta
        ) values (
          v_day_ts + (s * 40 + 120 || ' seconds')::interval,
          v_session_id,
          'pageview',
          '/join',
          v_source,
          v_device,
          false,
          '{"seed": true}'::jsonb
        );
      end if;

    end loop;
  end loop;

  -- Add a few bot events to test bot-filtering
  insert into public.page_events (
    created_at, session_id, event_type, path, source, device, is_bot, meta
  ) values (
    now() - interval '1 hour',
    'seed_bot_session_xyz',
    'pageview',
    '/',
    'google',
    'desktop',
    true,
    '{"seed": true}'::jsonb
  );

  raise notice 'Seeded 30 days of analytics data successfully with meta.seed = true';
end $$;
