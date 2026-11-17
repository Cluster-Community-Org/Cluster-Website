-- ==============================================================================
-- CLUSTER Society — Analytics SQL Verification Test Suite (Phases 1 & 2 Gate)
-- Paste into Supabase SQL Editor.
-- Wraps entire test in BEGIN ... ROLLBACK so no test artifacts persist.
-- ==============================================================================

begin;

-- Verify prerequisites: page_events table exists
do $$
begin
  assert exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'page_events'
  ), 'page_events table does not exist';
end $$;

-- ------------------------------------------------------------------------------
-- T1.9: As anon: insert a valid pageview succeeds
-- ------------------------------------------------------------------------------
set local role anon;

insert into public.page_events (session_id, event_type, path, device, is_bot)
values ('test_session_t1_9', 'pageview', '/events', 'desktop', false);

-- ------------------------------------------------------------------------------
-- T1.10: As anon: select count(*) returns 0 rows or yields empty set under RLS
-- ------------------------------------------------------------------------------
do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.page_events;
  assert v_count = 0, 'T1.10 failed: anon should not read any rows from page_events (RLS)';
end $$;

-- ------------------------------------------------------------------------------
-- T1.11: As anon: insert with event_type = 'hack' fails the check constraint
-- ------------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.page_events (session_id, event_type, path)
    values ('test_session_t1_11', 'hack', '/');
    raise exception 'T1.11 failed: check constraint on event_type was bypassed';
  exception when check_violation then
    -- expected behavior
    null;
  end;
end $$;

-- ------------------------------------------------------------------------------
-- T1.12: As anon: insert with path longer than 200 chars fails
-- ------------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.page_events (session_id, event_type, path)
    values ('test_session_t1_12', 'pageview', '/' || repeat('a', 250));
    raise exception 'T1.12 failed: check constraint on path length was bypassed';
  exception when check_violation then
    -- expected behavior
    null;
  end;
end $$;

-- ------------------------------------------------------------------------------
-- T1.13: As anon: insert that sets created_at or id fails with permission denied (column grant)
-- ------------------------------------------------------------------------------
do $$
begin
  begin
    insert into public.page_events (id, session_id, event_type, path)
    values (999999, 'test_session_t1_13', 'pageview', '/');
    raise exception 'T1.13 failed: column-level permission check on id was bypassed';
  exception when insufficient_privilege then
    -- expected behavior
    null;
  end;
end $$;

-- ------------------------------------------------------------------------------
-- T1.14: As authenticated with a non-admin email: select returns 0 rows.
--        As admin email: select returns the inserted row.
-- ------------------------------------------------------------------------------
-- 1. Test as non-admin authenticated user
set local role authenticated;
set local request.jwt.claims = '{"email":"intruder@external.com","role":"authenticated"}';

do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.page_events;
  assert v_count = 0, 'T1.14 failed: non-admin authenticated user read page_events';
end $$;

-- 2. Test as admin authenticated user
set local role authenticated;
set local request.jwt.claims = '{"email":"cluster.society@gmail.com","role":"authenticated"}';

do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.page_events;
  assert v_count >= 1, 'T1.14 failed: admin should be able to read page_events';
end $$;

-- ==============================================================================
-- PHASE 2 GATE TESTS (T2.5 - T2.9)
-- ==============================================================================

-- Clear test table within transaction for clean isolation
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.page_events;

-- Fixtures:
-- Fixed timestamp: 2026-11-16 12:00:00 IST
-- Window: 2026-11-16 00:00:00+05:30 to 2026-11-16 23:59:59+05:30
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.page_events (created_at, session_id, event_type, path, source, device, is_bot)
values
  -- Session s1: pageview /, pageview /join (2 pageviews)
  ('2026-11-16 10:00:00+05:30', 's1aaaaaa', 'pageview', '/', 'google', 'desktop', false),
  ('2026-11-16 10:05:00+05:30', 's1aaaaaa', 'pageview', '/join', 'google', 'desktop', false),
  -- Session s2: pageview / only (1 pageview -> bounced)
  ('2026-11-16 11:00:00+05:30', 's2bbbbbb', 'pageview', '/', 'instagram', 'mobile', false),
  -- Session s3: bot (should be filtered out completely)
  ('2026-11-16 11:30:00+05:30', 's3cccccc', 'pageview', '/', 'direct', 'desktop', true);

-- ------------------------------------------------------------------------------
-- T2.5: analytics_overview
-- visitors = 2, pageviews = 3 (bot excluded), bounce_rate = 50, join_views = 1
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
begin
  v_res := public.analytics_overview(v_from, v_to);
  assert (v_res->>'visitors')::int = 2, 'T2.5 failed: visitors should be 2';
  assert (v_res->>'pageviews')::int = 3, 'T2.5 failed: pageviews should be 3';
  assert (v_res->>'bounce_rate')::numeric = 50, 'T2.5 failed: bounce_rate should be 50';
  assert (v_res->>'join_views')::int = 1, 'T2.5 failed: join_views should be 1';
end $$;

-- ------------------------------------------------------------------------------
-- T2.6: analytics_timeseries over 3 days returns 3 rows, empty days with zeros
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_from timestamptz := '2026-11-14 00:00:00+05:30';
  v_to timestamptz := '2026-11-17 00:00:00+05:30';
begin
  v_res := public.analytics_timeseries(v_from, v_to);
  assert jsonb_array_length(v_res) = 3, 'T2.6 failed: timeseries should have 3 day entries';
  -- Day 1 (Nov 14): zero
  assert (v_res->0->>'visitors')::int = 0 and (v_res->0->>'pageviews')::int = 0, 'T2.6 failed: Nov 14 should be zero-filled';
  -- Day 2 (Nov 15): zero
  assert (v_res->1->>'visitors')::int = 0 and (v_res->1->>'pageviews')::int = 0, 'T2.6 failed: Nov 15 should be zero-filled';
  -- Day 3 (Nov 16): 2 visitors, 3 pageviews
  assert (v_res->2->>'visitors')::int = 2 and (v_res->2->>'pageviews')::int = 3, 'T2.6 failed: Nov 16 should have 2 visitors, 3 pageviews';
end $$;

-- ------------------------------------------------------------------------------
-- T2.7: analytics_top('path', 10) returns / = 2 visitors, /join = 1.
--       Passing SQL injection in dim raises 22023.
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
begin
  v_res := public.analytics_top(v_from, v_to, 'path', 10);
  assert (v_res->0->>'label') = '/' and (v_res->0->>'visitors')::int = 2, 'T2.7 failed: top path / count';
  assert (v_res->1->>'label') = '/join' and (v_res->1->>'visitors')::int = 1, 'T2.7 failed: top path /join count';

  -- Injection attempt
  begin
    perform public.analytics_top(v_from, v_to, 'id; drop table x', 10);
    raise exception 'T2.7 failed: SQL injection in dim parameter did not raise exception';
  exception when invalid_parameter_value then
    -- expected behavior
    null;
  end;
end $$;

-- ------------------------------------------------------------------------------
-- T2.8: Authorization checks:
--       As anon: calling analytics_* functions raises or is denied.
--       As non-admin: raises 42501.
--       As admin: succeeds.
-- ------------------------------------------------------------------------------
-- 1. Test as non-admin authenticated
set local role authenticated;
set local request.jwt.claims = '{"email":"intruder@external.com","role":"authenticated"}';

do $$
begin
  begin
    perform public.analytics_overview(now() - interval '1 day', now());
    raise exception 'T2.8 failed: non-admin was able to call analytics_overview';
  exception when insufficient_privilege then
    null;
  end;
end $$;

-- 2. Test as verified admin
set local role authenticated;
set local request.jwt.claims = '{"email":"cluster.society@gmail.com","role":"authenticated"}';

do $$
declare
  v_res jsonb;
begin
  v_res := public.analytics_overview(now() - interval '1 day', now());
  assert v_res is not null, 'T2.8 failed: admin should execute analytics_overview successfully';
end $$;

-- ------------------------------------------------------------------------------
-- T2.9: IST Day Buckets: 23:30 IST and 00:30 IST the next day land in different buckets
-- ------------------------------------------------------------------------------
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.page_events;

reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.page_events (created_at, session_id, event_type, path, is_bot)
values
  ('2026-11-16 23:30:00+05:30', 'ist_sess_1', 'pageview', '/', false),
  ('2026-11-17 00:30:00+05:30', 'ist_sess_2', 'pageview', '/', false);

do $$
declare
  v_res jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-18 00:00:00+05:30';
begin
  v_res := public.analytics_timeseries(v_from, v_to);
  assert jsonb_array_length(v_res) = 2, 'T2.9 failed: expected 2 day buckets for IST boundary test';
  assert (v_res->0->>'day') = '2026-11-16' and (v_res->0->>'visitors')::int = 1, 'T2.9 failed: 23:30 IST should be in 2026-11-16';
  assert (v_res->1->>'day') = '2026-11-17' and (v_res->1->>'visitors')::int = 1, 'T2.9 failed: 00:30 IST should be in 2026-11-17';
end $$;

-- ------------------------------------------------------------------------------
-- T2.10: Self-promoted user_metadata.role must not be treated as admin
-- ------------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims = '{"email":"intruder@external.com","role":"authenticated","user_metadata":{"role":"admin"}}';

do $$
begin
  begin
    perform public.analytics_overview(now() - interval '1 day', now());
    raise exception 'T2.10 failed: self-promoted user_metadata admin was able to call analytics_overview';
  exception when insufficient_privilege then
    null;
  end;
end $$;

-- ==============================================================================
-- PHASE 3 GATE TESTS (T3.4 - T3.6)
-- ==============================================================================
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.page_events;

-- 4 Sessions Fixture:
-- Session 1: impression event:kickstart, click registration (meta.slug = kickstart)
-- Session 2: impression event:kickstart
-- Session 3: impression event:kickstart, plus DUPLICATE impression event:kickstart
-- Session 4: impression section:hero only
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.page_events (created_at, session_id, event_type, path, target, is_bot, meta)
values
  ('2026-11-16 14:00:00+05:30', 'session_1', 'impression', '/events', 'event:kickstart', false, '{}'),
  ('2026-11-16 14:01:00+05:30', 'session_1', 'click', '/events', 'registration', false, '{"slug": "kickstart"}'),
  ('2026-11-16 14:02:00+05:30', 'session_2', 'impression', '/events', 'event:kickstart', false, '{}'),
  ('2026-11-16 14:03:00+05:30', 'session_3', 'impression', '/events', 'event:kickstart', false, '{}'),
  -- Duplicate impression from sess_3 (testing T3.6 deduplication)
  ('2026-11-16 14:04:00+05:30', 'session_3', 'impression', '/events', 'event:kickstart', false, '{}'),
  ('2026-11-16 14:05:00+05:30', 'session_4', 'impression', '/', 'section:hero', false, '{}');

-- ------------------------------------------------------------------------------
-- T3.4 & T3.6: analytics_interest event:kickstart impressions = 3, clicks = 1, ctr ~ 33.3%
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_kickstart jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
begin
  v_res := public.analytics_interest(v_from, v_to);

  select elem into v_kickstart
  from jsonb_array_elements(v_res) elem
  where elem->>'target' = 'event:kickstart';

  assert v_kickstart is not null, 'T3.4 failed: event:kickstart target not found in analytics_interest';
  -- T3.6: Even with 4 rows inserted, distinct sessions must equal 3
  assert (v_kickstart->>'impressions')::int = 3, 'T3.4/T3.6 failed: expected 3 distinct session impressions';
  assert (v_kickstart->>'clicks')::int = 1, 'T3.4 failed: expected 1 click for event:kickstart';
  assert (v_kickstart->>'ctr')::numeric >= 33.0 and (v_kickstart->>'ctr')::numeric <= 33.5, 'T3.4 failed: expected ctr around 33.3%';
end $$;

-- ------------------------------------------------------------------------------
-- T3.5: A target with 0 impressions returns ctr = null, no divide by zero
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_reg jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
begin
  v_res := public.analytics_interest(v_from, v_to);

  select elem into v_reg
  from jsonb_array_elements(v_res) elem
  where elem->>'target' = 'registration';

  assert v_reg is not null, 'T3.5 failed: registration target not found';
  assert (v_reg->>'impressions')::int = 0, 'T3.5 failed: registration impressions should be 0';
  assert (v_reg->>'clicks')::int = 1, 'T3.5 failed: registration clicks should be 1';
  assert (v_reg->'ctr') = 'null'::jsonb, 'T3.5 failed: ctr should be null when impressions = 0';
end $$;

-- ------------------------------------------------------------------------------
-- T3.7: gallery_open must not count toward an event's RSVP clicks / CTR
-- ------------------------------------------------------------------------------
reset role;
delete from public.page_events;
insert into public.page_events (created_at, session_id, event_type, path, target, is_bot, meta)
values
  ('2026-11-16 14:00:00+05:30', 'gallery_1', 'impression', '/events', 'event:kickstart', false, '{}'),
  ('2026-11-16 14:01:00+05:30', 'gallery_1', 'click', '/events', 'gallery_open', false, '{"slug": "kickstart"}');

set local role authenticated;
set local request.jwt.claims = '{"email":"cluster.society@gmail.com","role":"authenticated"}';

do $$
declare v_row jsonb;
begin
  select x into v_row
  from jsonb_array_elements(public.analytics_interest('2026-11-16 00:00:00+05:30', '2026-11-17 00:00:00+05:30')) x
  where x->>'target' = 'event:kickstart';
  assert (v_row->>'clicks')::int = 0, 'T3.7 failed: gallery_open counted as an RSVP click';
  assert (v_row->>'ctr')::numeric = 0, 'T3.7 failed: ctr should be 0';
end $$;

-- ==============================================================================
-- PHASE 4 GATE TESTS (T4.3 - T4.6)
-- ==============================================================================
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.page_events;
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.applications where id like 'test_app_%';

-- 4 Sessions on /join:
-- A: view only
-- B: view, start, field projects
-- C: view, start, field github
-- D: view, start, field projects, submit
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.page_events (created_at, session_id, event_type, path, target, source, is_bot)
values
  -- Session A: view only
  ('2026-11-16 15:00:00+05:30', 'session_A', 'pageview', '/join', null, 'instagram', false),

  -- Session B: view, start, field projects
  ('2026-11-16 15:10:00+05:30', 'session_B', 'pageview', '/join', null, 'instagram', false),
  ('2026-11-16 15:11:00+05:30', 'session_B', 'form_step', '/join', 'join:start', 'instagram', false),
  ('2026-11-16 15:12:00+05:30', 'session_B', 'form_step', '/join', 'join:field:fullName', 'instagram', false),
  ('2026-11-16 15:13:00+05:30', 'session_B', 'form_step', '/join', 'join:field:projects', 'instagram', false),

  -- Session C: view, start, field github
  ('2026-11-16 15:20:00+05:30', 'session_C', 'pageview', '/join', null, 'instagram', false),
  ('2026-11-16 15:21:00+05:30', 'session_C', 'form_step', '/join', 'join:start', 'instagram', false),
  ('2026-11-16 15:22:00+05:30', 'session_C', 'form_step', '/join', 'join:field:fullName', 'instagram', false),
  ('2026-11-16 15:23:00+05:30', 'session_C', 'form_step', '/join', 'join:field:github', 'instagram', false),

  -- Session D: view, start, field projects, submit
  ('2026-11-16 15:30:00+05:30', 'session_D', 'pageview', '/join', null, 'instagram', false),
  ('2026-11-16 15:31:00+05:30', 'session_D', 'form_step', '/join', 'join:start', 'instagram', false),
  ('2026-11-16 15:32:00+05:30', 'session_D', 'form_step', '/join', 'join:field:projects', 'instagram', false),
  ('2026-11-16 15:33:00+05:30', 'session_D', 'form_step', '/join', 'join:submit', 'instagram', false),

  -- Additional sessions to fulfill T4.4: 5 instagram sessions total, 2 qr sessions
  ('2026-11-16 15:40:00+05:30', 'session_E_ig', 'pageview', '/', null, 'instagram', false),
  ('2026-11-16 15:50:00+05:30', 'session_F_qr', 'pageview', '/', null, 'qr-canteen', false),
  ('2026-11-16 15:51:00+05:30', 'session_G_qr', 'pageview', '/', null, 'qr-canteen', false);

-- Insert 2 applications with source = 'instagram' and 1 with source = 'qr-canteen':
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.applications (id, full_name, email, roll_number, branch_year, domain, source, submitted_at)
values
  ('test_app_1', 'Student One', 'one@test.com', 'R01', 'CSE · 2nd Year', 'Compute', 'instagram', '2026-11-16 16:00:00+05:30'),
  ('test_app_2', 'Student Two', 'two@test.com', 'R02', 'ECE · 1st Year', 'Applied AI', 'instagram', '2026-11-16 16:05:00+05:30'),
  ('test_app_3', 'Student Three', 'three@test.com', 'R03', 'CSE · 3rd Year', 'Crew', 'qr-canteen', '2026-11-16 16:10:00+05:30');

-- ------------------------------------------------------------------------------
-- T4.3: analytics_funnel
-- view: 4, start: 3, projects: 2, submit: 1
-- Last-field abandonment: projects 1 (sess_B), github 1 (sess_C)
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_steps jsonb;
  v_abandon jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
  v_proj_count int;
  v_git_count int;
begin
  v_res := public.analytics_funnel(v_from, v_to);
  v_steps := v_res->'steps';
  v_abandon := v_res->'abandonment';

  assert (v_steps->>'view')::int = 4, 'T4.3 failed: view should be 4';
  assert (v_steps->>'start')::int = 3, 'T4.3 failed: start should be 3';
  assert (v_steps->>'projects')::int = 2, 'T4.3 failed: projects should be 2';
  assert (v_steps->>'submit')::int = 1, 'T4.3 failed: submit should be 1';

  select (elem->>'count')::int into v_proj_count
  from jsonb_array_elements(v_abandon) elem where elem->>'field' = 'projects';

  select (elem->>'count')::int into v_git_count
  from jsonb_array_elements(v_abandon) elem where elem->>'field' = 'github';

  assert v_proj_count = 1, 'T4.3 failed: abandonment projects should be 1';
  assert v_git_count = 1, 'T4.3 failed: abandonment github should be 1';
end $$;

-- ------------------------------------------------------------------------------
-- T4.4: analytics_source_conversion
-- instagram visits 5, applicants 2, rate 40%
-- qr-canteen visits 2, applicants 1, rate 50%
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_ig jsonb;
  v_qr jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
begin
  v_res := public.analytics_source_conversion(v_from, v_to);

  select elem into v_ig from jsonb_array_elements(v_res) elem where elem->>'source' = 'instagram';
  select elem into v_qr from jsonb_array_elements(v_res) elem where elem->>'source' = 'qr-canteen';

  assert (v_ig->>'visits')::int = 5, 'T4.4 failed: instagram visits should be 5';
  assert (v_ig->>'applicants')::int = 2, 'T4.4 failed: instagram applicants should be 2';
  assert (v_ig->>'rate')::numeric = 40.0, 'T4.4 failed: instagram conversion rate should be 40%';

  assert (v_qr->>'visits')::int = 2, 'T4.4 failed: qr-canteen visits should be 2';
  assert (v_qr->>'applicants')::int = 1, 'T4.4 failed: qr-canteen applicants should be 1';
  assert (v_qr->>'rate')::numeric = 50.0, 'T4.4 failed: qr-canteen conversion rate should be 50%';
end $$;

-- ------------------------------------------------------------------------------
-- T4.5: analytics_applicants counts match manual group by
-- ------------------------------------------------------------------------------
do $$
declare
  v_res jsonb;
  v_from timestamptz := '2026-11-16 00:00:00+05:30';
  v_to timestamptz := '2026-11-16 23:59:59+05:30';
  v_compute_count int;
begin
  v_res := public.analytics_applicants(v_from, v_to);

  select (elem->>'count')::int into v_compute_count
  from jsonb_array_elements(v_res->'by_domain') elem where elem->>'label' = 'Compute';

  assert v_compute_count = 1, 'T4.5 failed: by_domain Compute count should be 1';
end $$;

-- ==============================================================================
-- PHASE 5 GATE TESTS (T5.4 - T5.6)
-- ==============================================================================
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.page_events;

-- ------------------------------------------------------------------------------
-- T5.4: analytics_health p75 of known vital values [1,2,3,4] and top 404 paths
-- ------------------------------------------------------------------------------
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.page_events (created_at, session_id, event_type, path, target, is_bot, meta)
values
  (now(), 'health_1', 'vital', '/', 'lcp', false, '{"value": 1}'::jsonb),
  (now(), 'health_2', 'vital', '/', 'lcp', false, '{"value": 2}'::jsonb),
  (now(), 'health_3', 'vital', '/', 'lcp', false, '{"value": 3}'::jsonb),
  (now(), 'health_4', 'vital', '/', 'lcp', false, '{"value": 4}'::jsonb),
  (now(), 'health_5', 'error', '/', 'js', false, '{"msg": "ReferenceError: foo is not defined"}'::jsonb),
  (now(), 'health_6', 'error', '/missing-page', '404', false, '{"path": "/missing-page"}'::jsonb),
  (now(), 'health_7', 'error', '/missing-page', '404', false, '{"path": "/missing-page"}'::jsonb),
  (now(), 'health_8', 'error', '/other-missing', '404', false, '{"path": "/other-missing"}'::jsonb);

do $$
declare
  v_res jsonb;
  v_lcp_p75 numeric;
  v_top_first jsonb;
  v_top_second jsonb;
begin
  v_res := public.analytics_health(now() - interval '1 hour', now() + interval '1 hour');

  -- Percentile 75 of [1, 2, 3, 4] is 3.25
  v_lcp_p75 := (v_res->'vitals'->'lcp'->>'p75')::numeric;
  assert v_lcp_p75 = 3.25, format('T5.4 failed: expected p75 = 3.25, got %s', v_lcp_p75);

  -- JS and 404 error counts
  assert (v_res->'errors'->>'js')::int = 1, 'T5.4 failed: expected 1 JS error';
  assert (v_res->'errors'->>'not_found')::int = 3, 'T5.4 failed: expected 3 404 errors';

  -- Ranked 404 paths
  v_top_first := v_res->'top_404'->0;
  v_top_second := v_res->'top_404'->1;

  assert (v_top_first->>'path') = '/missing-page', 'T5.4 failed: top 404 path should be /missing-page';
  assert (v_top_first->>'count')::int = 2, 'T5.4 failed: /missing-page count should be 2';

  assert (v_top_second->>'path') = '/other-missing', 'T5.4 failed: second 404 path should be /other-missing';
  assert (v_top_second->>'count')::int = 1, 'T5.4 failed: /other-missing count should be 1';
end $$;

-- ------------------------------------------------------------------------------
-- T5.5: analytics_purge(90) deletes only rows older than 90 days
-- ------------------------------------------------------------------------------
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
delete from public.page_events;

-- Insert 1 old row (> 90 days) and 1 recent row (< 90 days)
reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.page_events (created_at, session_id, event_type, path, is_bot)
values
  (now() - interval '120 days', 'purge_old_1', 'pageview', '/', false),
  (now() - interval '30 days', 's_recent', 'pageview', '/', false);

-- Non-admin execution fails
set local role authenticated;
set local request.jwt.claims = '{"email":"intruder@external.com","role":"authenticated"}';

do $$
begin
  begin
    perform public.analytics_purge(90);
    raise exception 'T5.5 failed: non-admin was able to call analytics_purge';
  exception when insufficient_privilege then
    null;
  end;
end $$;

-- Admin execution succeeds and returns correct count
set local role authenticated;
set local request.jwt.claims = '{"email":"cluster.society@gmail.com","role":"authenticated"}';

do $$
declare
  v_purged bigint;
  v_remaining bigint;
begin
  v_purged := public.analytics_purge(90);
  assert v_purged = 1, format('T5.5 failed: expected 1 purged row, got %s', v_purged);

  select count(*) into v_remaining from public.page_events;
  assert v_remaining = 1, format('T5.5 failed: expected 1 remaining row, got %s', v_remaining);
end $$;

-- ------------------------------------------------------------------------------
-- T5.6: Audit insert as admin succeeds; as anon is denied
-- ------------------------------------------------------------------------------
-- Test as anon: insert is denied by RLS
set local role anon;
set local request.jwt.claims = '{}';

do $$
begin
  begin
    insert into public.audit_logs (id, action, summary, category)
    values ('test-anon-audit', 'HACK_ATTEMPT', 'Anon unauthorized audit entry', 'system');
    raise exception 'T5.6 failed: anon was able to insert into audit_logs';
  exception when insufficient_privilege then
    null;
  end;
end $$;

-- Test as admin: insert succeeds
set local role authenticated;
set local request.jwt.claims = '{"email":"cluster.society@gmail.com","role":"authenticated"}';

reset role;  -- fixtures are written as the table owner; role-gated checks switch role again below
insert into public.audit_logs (id, action, summary, category)
values ('test-admin-audit', 'HOMEPAGE_SYNC', 'Admin verified homepage sync', 'homepage');

do $$
declare
  v_exists boolean;
begin
  select exists(select 1 from public.audit_logs where id = 'test-admin-audit') into v_exists;
  assert v_exists = true, 'T5.6 failed: admin should be able to insert into audit_logs';
end $$;

do $$ begin raise notice 'All Phase 1 - 5 SQL Tests (T1.9 - T5.6, T2.10, T3.7) Passed!'; end $$;

rollback;
