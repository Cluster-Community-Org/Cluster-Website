# Admin Analytics: Implementation Plan

Audience: the developer (and their AI code editor) building analytics into the CLUSTER admin panel.
Owner: Kurian. Where this plan says "Owner", it means a step only Kurian can do (database access, Vercel settings, decisions).

How to use this file: build one phase at a time, in order. Each phase ends with a test gate. Do not start the next phase until every test in the current gate passes and you have reported the results. If you are an AI editor, treat this file as the spec, do not widen scope, and do not touch files outside the phase.

---

## 0. Read this first: facts about the codebase

The repo docs are partly stale. `docs/ADMIN-CMS.md`, `docs/API.md` and `docs/DEPLOYMENT.md` describe MongoDB, Express and Cloudinary. **None of that exists.** The real stack is below. Trust the code, not those docs.

| Fact | Where | Why it matters |
|---|---|---|
| Vite + React 19 SPA, React Router 7, Tailwind 3, lucide-react. No chart library, no test framework beyond `node:test`. | `client/package.json` | Charts are hand-built SVG. Tests are pure-JS `node:test` files. |
| Supabase is the backend. Admin writes are guarded by RLS using `public.is_admin()`. | `supabase/schema.sql` | New table and functions must follow the same pattern. |
| All data access is in one ~1000-line file, `clusterDataService.js`, localStorage-first with Supabase sync. | `client/src/services/clusterDataService.js` | Do NOT add analytics to it. Create a separate `analyticsService.js`. |
| `npm test` runs `node --test src/**/*.test.js`. | `client/package.json` | Shell glob gotcha, see section 3. Keep test files at `client/src/lib/*.test.js`. |
| Any file that imports `supabaseClient.js` throws under Node (`import.meta.env` is undefined). | `client/src/lib/supabaseClient.js` | Pure logic must live in files that do not import it, or it cannot be unit tested. |
| PostHog is already wired in, optional, via `VITE_POSTHOG_KEY`. It captures pageviews, autocapture and JS errors, skips `/admin`. One custom event: `application_submitted`. | `client/index.html`, `JoinPage.jsx:55` | Overlaps with this plan. See Decision D1. |
| `logAudit()` writes to localStorage only. It never inserts into the Supabase `audit_logs` table. | `clusterDataService.js:836` | Chart annotations and "content freshness" cannot read the audit log until Phase 5 fixes this. |
| The catch-all route redirects unknown URLs to `/`. 404s are never rendered. | `client/src/routes/index.jsx` | 404 tracking needs a hook in the catch-all route (Phase 5). |
| Event cards on `/events` are not clickable. Only the RSVP link and the Photos button are interactive. | `EventsPage.jsx:56-95` | The mockup's "event card opens" becomes "event impressions" (card scrolled into view) plus RSVP clicks. |
| The admin UI guard is client-side (localStorage `cluster_admin_auth`). Real protection is RLS. | `AdminLayout.jsx` | Every analytics RPC must check `is_admin()` server-side. Never trust the UI guard. |
| `applications` insert has a fallback that retries with a legacy payload when a column is missing. | `clusterDataService.js:627-650` | If you add columns (Phase 4), update both payloads or inserts can silently drop data. |

### Pre-existing security issue (Owner action, not part of the build)

`public.is_admin()` accepts `auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'`. In Supabase, `user_metadata` is editable by the signed-in user themselves (`supabase.auth.updateUser({ data: { role: 'admin' } })`). If public sign-ups or any non-admin login is enabled, anyone could promote themselves and read `applications` (names, emails, roll numbers) and all analytics. Recommended: remove the `user_metadata` line from `is_admin()` and rely on `app_metadata` (server-only) or the email allowlist. Verify in Supabase Auth settings whether sign-ups are disabled. The analytics RPCs in this plan inherit whatever `is_admin()` allows.

---

## 1. Decisions (confirm before Phase 1)

| ID | Decision | Default if not answered |
|---|---|---|
| D1 | **Collector.** Option A: own `page_events` table in Supabase, native charts in the panel, joins with applicants. Option B: keep PostHog as the collector and query it from a Vercel serverless function (needs a PostHog personal API key as a Vercel env var and a function that verifies the Supabase admin JWT). | **A.** Reasons: data lands next to `applications`, no third-party key proxy, no cookies or consent banner. PostHog stores an identifier in the browser by default, which conflicts with the "no banner" approach. B is less collector code but cannot join with applicants and keeps data with a third party. |
| D2 | **PostHog after Phase 4 is verified.** Remove the snippet in `index.html` and the `window.posthog?.capture` line in `JoinPage.jsx`, or keep it. | Remove, to avoid double collection. Owner confirms. |
| D3 | **Retention.** Keep raw events forever, or purge after N days. | 90 days, via `analytics_purge()` (Phase 5). Owner enables the schedule. |
| D4 | **Charts.** Hand-rolled SVG, or add Recharts. | Hand-rolled SVG, no dependency. Matches the existing dashboard donut in `AdminDashboard.jsx`. |
| D5 | **Time zone for day buckets.** | `Asia/Kolkata`. |

Appendix B describes what changes if D1 is B.

---

## 2. Architecture

```
Public site (browser)                                  Supabase                         Admin panel
-----------------------                                --------                         -----------
<Analytics/> in App.jsx                                page_events (RLS: anon INSERT    AdminAnalytics.jsx
  pageview, clicks, impressions,    fetch keepalive    only, admin SELECT only)        AdminDashboard.jsx (tiles)
  form steps, vitals, errors     -----------------> (batched POST to /rest/v1)             |
  analyticsCore.js (pure logic)                        analytics_* RPC functions  <--------+ analyticsService.js
  analytics.js (browser glue)                          (SECURITY DEFINER, is_admin())      supabase.rpc(...)
```

Principles:

1. **Pure core, thin glue.** All decisions (is this a bot, what is the source, build the event, batch) live in plain JS files with no browser or Supabase imports, so `node --test` covers them. Browser code only wires them to the DOM.
2. **Aggregate in SQL.** The admin page calls RPC functions that return small result sets. It never downloads raw events.
3. **Privacy by construction.** No cookies, no IPs, no emails or roll numbers in events, query strings stripped from stored paths, per-tab random session id.
4. **Kill switches.** `VITE_ANALYTICS_DISABLED=true` turns the tracker off. Do Not Track is honored. Admin browsers are excluded.

### 2.1 Data model (put in `supabase/analytics.sql`, idempotent like `schema.sql`)

```sql
create table if not exists public.page_events (
  id          bigint generated by default as identity primary key,
  created_at  timestamptz not null default now(),
  session_id  text not null check (char_length(session_id) between 8 and 64),
  event_type  text not null check (event_type in
              ('pageview','click','impression','form_step','vital','error')),
  path        text not null check (char_length(path) <= 200),
  target      text check (char_length(target) <= 200),
  source      text check (char_length(source) <= 100),
  referrer    text check (char_length(referrer) <= 300),
  utm_source  text check (char_length(utm_source) <= 100),
  utm_medium  text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  device      text check (device in ('mobile','tablet','desktop')),
  is_bot      boolean not null default false,
  meta        jsonb not null default '{}'::jsonb check (pg_column_size(meta) <= 1024)
);

create index if not exists page_events_created_idx on public.page_events (created_at desc);
create index if not exists page_events_type_created_idx on public.page_events (event_type, created_at desc);
create index if not exists page_events_session_idx on public.page_events (session_id);

alter table public.page_events enable row level security;

-- Anyone may INSERT. Nobody but admins may read.
drop policy if exists "page_events anon insert" on public.page_events;
create policy "page_events anon insert" on public.page_events
  for insert to anon, authenticated with check (true);

drop policy if exists "page_events admin read" on public.page_events;
create policy "page_events admin read" on public.page_events
  for select to authenticated using (public.is_admin());

-- Column-level insert grant so visitors cannot forge created_at, id or is_bot-less rows.
revoke insert on public.page_events from anon, authenticated;
grant insert (session_id, event_type, path, target, source, referrer,
              utm_source, utm_medium, utm_campaign, device, is_bot, meta)
  on public.page_events to anon, authenticated;
```

Also in `analytics.sql` (Phase 4): `alter table public.applications add column if not exists source text; alter table public.applications add column if not exists utm_campaign text;`

### 2.2 RPC pattern (every function follows this shape)

```sql
create or replace function public.analytics_overview(p_from timestamptz, p_to timestamptz)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  -- ... aggregate over page_events where created_at >= p_from and created_at < p_to and not is_bot
  return r;
end $$;
revoke all on function public.analytics_overview(timestamptz, timestamptz) from public, anon;
grant execute on function public.analytics_overview(timestamptz, timestamptz) to authenticated;
```

Rules: always filter `not is_bot`; never build SQL from text input (the `dim` parameter of `analytics_top` is whitelisted with `case`); bucket days with `date_trunc('day', created_at at time zone 'Asia/Kolkata')` and use `generate_series` so empty days appear as zero.

Functions to create across phases:

| Function | Phase | Returns |
|---|---|---|
| `analytics_overview(from, to)` | 2 | visitors, pageviews, bounce_rate, join_views, join_submits |
| `analytics_timeseries(from, to)` | 2 | rows of day, visitors, pageviews (zero-filled) |
| `analytics_top(from, to, dim, lim)` | 2 | dim in `path`, `source`, `device`, `utm_campaign`; rows of label, visitors |
| `analytics_interest(from, to)` | 3 | per target: impressions, clicks, ctr. Plus section reach percentages |
| `analytics_funnel(from, to)` | 4 | counts for join view, start, projects field, submit. Plus last-field abandonment |
| `analytics_source_conversion(from, to)` | 4 | per source: visits, applicants (from `applications.source`), rate |
| `analytics_applicants(from, to)` | 4 | counts by branch, year, status; average hours in stage is not stored, so omit "time in stage" unless a `status_changed_at` column is added (see Phase 4 note) |
| `analytics_health(from, to)` | 5 | vitals p75 by metric, error counts, top 404 paths |
| `analytics_purge(p_days int)` | 5 | deletes events older than N days; admin only |

### 2.3 Event taxonomy

| event_type | target | meta | Fired when |
|---|---|---|---|
| `pageview` | none | `{}` | Route change on a non-admin path (first load included) |
| `click` | value of `data-track`, for example `registration`, `banner_cta`, `team_github`, `team_linkedin`, `outbound` | `{ "slug": "...", "host": "..." }` | Click on an element inside `[data-track]`, or an outbound link |
| `impression` | `event:<slug>` or `section:<name>` | `{}` | Element with `data-impression` or `data-section` is at least 50% visible. Once per session per target |
| `form_step` | `join:view`, `join:start`, `join:field:<name>`, `join:submit` | `{}` | Join form lifecycle. `join:field:<name>` fires on first focus of each field |
| `vital` | `LCP`, `CLS`, `INP` | `{ "value": number }` | Once per page load, Phase 5 |
| `error` | `js` or `404` | `{ "msg": "<=200 chars" }` | `window.onerror`, unhandled rejection (max 5 per session), unknown route |

Source normalization (`classifySource`), applied once per session on the first pageview and cached as first-touch in `sessionStorage`:

1. `utm_source` present: lowercase it.
2. Else referrer host: `instagram.com`, `l.instagram.com` to `instagram`; `wa.me`, `web.whatsapp.com`, `whatsapp.com` to `whatsapp`; `google.*` to `google`; `t.co`, `twitter.com`, `x.com` to `x`; `linkedin.com`, `lnkd.in` to `linkedin`; `youtube.com`, `youtu.be` to `youtube`; `reddit.com` to `reddit`; `github.com` to `github`; same host as the site to no change (keep first-touch); any other host to that host.
3. Else `direct`.

---

## 3. Conventions and test setup

File layout. Keep logic files flat under `client/src/lib/` so `npm test` finds them:

```
client/src/lib/analyticsCore.js          pure: device, bot, utm, source, path sanitizing, buildEvent, batcher
client/src/lib/analyticsCore.test.js
client/src/lib/analyticsTrack.js         pure: findTrackTarget, isOutbound, once-per-session helper
client/src/lib/analyticsTrack.test.js
client/src/lib/analyticsFormat.js        pure: date ranges, previous period, deltas, chart geometry, CSV
client/src/lib/analyticsFormat.test.js
client/src/lib/analytics.js              browser glue (session, fetch keepalive, observers). Not unit tested.
client/src/services/analyticsService.js  supabase.rpc wrappers + demo fixtures. Not unit tested.
client/src/components/Analytics.jsx      router-aware mount point
client/src/components/admin/analytics/   KpiTile, LineChart, BarList, FunnelBars, RangePicker, Tabs
client/src/pages/admin/AdminAnalytics.jsx
supabase/analytics.sql                   table, grants, policies, RPCs (idempotent)
supabase/seed_analytics.sql              fake 30 days of events, tagged meta.seed = true
supabase/tests/analytics.test.sql        SQL assertion script, runs in the SQL editor, ends in ROLLBACK
```

**Test glob gotcha.** The script `node --test src/**/*.test.js` expands differently by shell. In a POSIX shell `**` behaves like `*`, so only `src/<dir>/<file>.test.js` is found; deeper paths are silently skipped. Put every new test file at exactly `client/src/lib/*.test.js`. After adding tests, confirm the test count printed by `npm test` went up. Run `node --version` and note it in your report.

**Do not unit test anything that imports `supabaseClient.js` or `clusterDataService.js`.** If you need to test `appToDB` / `appFromDB` (Phase 4), first move them into `client/src/lib/applicationMapper.js` (no Supabase import) and import them back into the service.

**Lint.** `npm run lint` references ESLint, but ESLint is not in `devDependencies` and there is no config. Do not gate on it unless you add it.

Commands (from `Cluster/client`):

```bash
npm test              # unit tests (node:test)
npm run build         # must pass at the end of every phase
npm run dev           # dev server on :5173 (or use .claude/launch.json "vite-dev")
```

SQL tests: open Supabase Dashboard, SQL Editor, paste `supabase/analytics.sql` first, then `supabase/tests/analytics.test.sql`. The test file wraps everything in `begin; ... rollback;` and uses `do $$ ... assert ... $$;` blocks, so it leaves no data behind. To act as a role in a test: `set local role anon;` or `set local role authenticated; set local request.jwt.claims = '{"email":"cluster.society@gmail.com","role":"authenticated"}';`.

Definition of done for every phase: (1) all gate tests pass, (2) `npm run build` passes, (3) no console errors on `/`, `/events`, `/join`, `/team`, `/admin/dashboard`, (4) a short report listing each test ID with pass or fail and any deviation from this plan.

Suggested prompt for the AI editor, per phase:

> Implement Phase N of `Cluster/docs/ANALYTICS-PLAN.md` only. Read section 0 and section 3 first. Create or edit only the files that phase lists. Write the tests in the phase gate, run `npm test` and `npm run build`, and report each test ID as pass or fail. Stop at the end of the phase.

---

## Phase 1: Capture foundation and pageviews

Goal: visitors and pageviews flow into `page_events`. No UI yet.

Tasks

1. `supabase/analytics.sql`: the table, indexes, RLS and column grants from section 2.1.
2. `client/src/lib/analyticsCore.js` (pure, no imports from browser or Supabase):
   - `classifyDevice(userAgent, viewportWidth)` returns `mobile`, `tablet` or `desktop`.
   - `isBot(userAgent)` true for empty UA, `HeadlessChrome`, and common crawler tokens (`bot`, `crawl`, `spider`, `slurp`, `lighthouse`, `preview`, `facebookexternalhit`).
   - `parseUtm(searchString)` returns `{ utm_source, utm_medium, utm_campaign }`, lowercased, trimmed to 100 chars.
   - `classifySource(referrer, utm, siteHost)` per section 2.3.
   - `sanitizePath(pathname)` returns the pathname only, no query string or hash, trimmed to 200 chars, trailing slash removed except root.
   - `shouldTrack({ disabled, dnt, adminFlag, pathname })` false when disabled, DNT is `'1'`, admin flag set, or path starts with `/admin`.
   - `buildEvent(partial, ctx)` fills defaults, truncates every string to its column limit, drops unknown keys, and caps `meta` at 1024 bytes by dropping keys.
   - `createBatcher({ send, maxSize = 10, flushMs = 3000, setTimer, clearTimer })` with injectable timers. `add(event)`, `flush()`. Flushes on `maxSize`, on the timer, and when `flush()` is called.
3. `client/src/lib/analytics.js` (browser glue):
   - Session id in `sessionStorage` (`cluster_sid`), `crypto.randomUUID()` with a fallback. A new tab is a new session; this is expected and documented.
   - First-touch source and UTM in `sessionStorage` (`cluster_src`).
   - Sender uses `fetch(SUPABASE_URL + '/rest/v1/page_events', { method: 'POST', keepalive: true, headers: { apikey, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(batch) })`. **Do not use `navigator.sendBeacon`**: it cannot set the `apikey` header, so Supabase would reject it. Swallow all errors; analytics must never break the site.
   - Flush on `visibilitychange` to hidden and on `pagehide`.
   - No-op when Supabase is not configured. With `VITE_ANALYTICS_DEBUG=true`, `console.debug` each event.
   - Export `track(type, target, meta)` and `trackPageview()`.
4. `client/src/components/Analytics.jsx`: uses `useLocation()`, calls `trackPageview()` on each route change. Mount inside `<BrowserRouter>` in `App.jsx`, above `<AppRoutes />`.
5. Admin exclusion: on successful admin login and on `AdminLayout` mount, set `localStorage.cluster_no_track = '1'` so team browsers never pollute data.
6. `.env.example`: document `VITE_ANALYTICS_DISABLED` and `VITE_ANALYTICS_DEBUG`.

Gate: tests

Unit, `client/src/lib/analyticsCore.test.js`:

| ID | Assertion |
|---|---|
| T1.1 | `classifyDevice`: iPhone UA gives mobile, iPad UA gives tablet, desktop Chrome gives desktop, width under 640 with unknown UA gives mobile |
| T1.2 | `isBot`: Googlebot, HeadlessChrome, empty string are true; Chrome and Safari UAs are false |
| T1.3 | `parseUtm`: `?utm_source=IG&utm_campaign=Kickstart` gives lowercase values; missing keys are undefined; 300-char value is cut to 100 |
| T1.4 | `classifySource` table: utm wins over referrer; `https://l.instagram.com/x` is `instagram`; `https://www.google.co.in/` is `google`; same host with no utm keeps `undefined`; no referrer is `direct`; unknown host returns the host |
| T1.5 | `sanitizePath`: `/join?email=a@b.com#x` becomes `/join`; `/events/` becomes `/events`; 500-char path is cut to 200 |
| T1.6 | `shouldTrack`: false for `/admin/login`, for DNT `'1'`, for `adminFlag`, for `disabled`; true otherwise |
| T1.7 | `buildEvent`: unknown keys dropped, long strings truncated, oversized `meta` reduced under 1024 bytes, invalid `event_type` throws |
| T1.8 | `createBatcher` with fake timers: 10 adds trigger one send of 10; 3 adds then timer fire sends 3; `flush()` on empty sends nothing; send error does not throw |

SQL, `supabase/tests/analytics.test.sql` (rollback at the end):

| ID | Assertion |
|---|---|
| T1.9 | As `anon`: insert a valid pageview succeeds |
| T1.10 | As `anon`: `select count(*) from page_events` returns 0 rows or permission denied, never real rows |
| T1.11 | As `anon`: insert with `event_type = 'hack'` fails the check constraint |
| T1.12 | As `anon`: insert with `path` longer than 200 chars fails |
| T1.13 | As `anon`: insert that sets `created_at` or `id` fails with permission denied (column grant) |
| T1.14 | As `authenticated` with a non-admin email: select returns 0 rows. As admin email: select returns the inserted row |

Manual browser checks (preview the dev server with a real Supabase `.env`):

| ID | Check |
|---|---|
| T1.15 | Open `/`, then `/events`, `/team`, `/join`. Network tab shows POSTs to `/rest/v1/page_events` returning 201. Four pageview rows appear in the Supabase table editor with correct `path`, `device`, `session_id` |
| T1.16 | Visit `/?utm_source=ig&utm_campaign=test`. Row has `utm_source = ig`, `utm_campaign = test`, `source = ig` |
| T1.17 | Visit `/admin/login`: no request to `page_events`. After logging in once, public pages in that browser also send nothing |
| T1.18 | Set DevTools Do Not Track on, or run `localStorage.cluster_no_track = '1'`: no requests |
| T1.19 | With `VITE_ANALYTICS_DISABLED=true`: no requests. With Supabase vars unset: site works, no errors |
| T1.20 | Block the Supabase domain in DevTools: site still works, no uncaught errors in console |

Exit: T1.1 to T1.20 pass, `npm run build` passes.

---

## Phase 2: Service layer, Dashboard tiles, Traffic tab

Goal: Kurian can see visitors, pageviews, top pages, sources and devices.

Tasks

1. `supabase/analytics.sql`: add `analytics_overview`, `analytics_timeseries`, `analytics_top` per section 2.2.
2. `supabase/seed_analytics.sql`: generate roughly 30 days of fake sessions with `generate_series`, mixed devices, sources and paths, every row with `meta = '{"seed": true}'`. Include a one-line cleanup: `delete from public.page_events where meta->>'seed' = 'true';`.
3. `client/src/lib/analyticsFormat.js` (pure):
   - `rangeToDates(days, now)` returns `{ from, to }` ISO strings; `previousRange({ from, to })`.
   - `pctDelta(current, previous)` returns a number or `null` when previous is 0.
   - `formatCompact(n)` (`1234` to `1.2k`), `formatPct(n)`.
   - `linePath(values, width, height, pad)` returns the SVG path string and point coordinates, and handles an empty array and a single value.
4. `client/src/services/analyticsService.js`: `getOverview`, `getTimeseries`, `getTop` wrapping `supabase.rpc`. Return `{ configured: false }` when Supabase is unset, `{ error: 'auth' }` on error code `42501`. When `VITE_ANALYTICS_DEMO=true`, return deterministic fixtures so the UI can be verified without data.
5. Shared UI in `client/src/components/admin/analytics/`: `KpiTile`, `LineChart` (SVG), `BarList`, `RangePicker` (7, 30, 90), `Tabs`. Reuse existing admin styles from `AdminDashboard.jsx` (`#0F1012` cards, `border-white/[0.08]`, `font-mono` labels, `text-cluster-acid`, `rounded-2xl`). Each handles loading, empty and error states.
6. `AdminAnalytics.jsx` with the Traffic tab only (KPI row, daily visitors chart, top pages, sources, devices, campaign links). Register the route `/admin/analytics` in `routes/index.jsx`, add a sidebar item (icon `LineChart` or `BarChart3` from lucide-react) and a section title in `AdminLayout.jsx`, and an entry in `CommandPalette.jsx`.
7. `AdminDashboard.jsx`: add the "Site traffic" section from the approved mockup below the existing KPI row (four tiles, visitors chart, top sources, "Open analytics" link). Leave everything else untouched.
8. Show an inline message when the admin is not signed in with a Supabase session: "Sign in with Supabase to view analytics." Do not crash.

Gate: tests

Unit, `client/src/lib/analyticsFormat.test.js`:

| ID | Assertion |
|---|---|
| T2.1 | `rangeToDates(30, fixedNow)` returns exactly 30 days ending at `fixedNow`; `previousRange` is the 30 days before it with no overlap or gap |
| T2.2 | `pctDelta(120, 100)` is 20; `pctDelta(0, 0)` and `pctDelta(5, 0)` are `null`; negative results work |
| T2.3 | `formatCompact`: 999, 1000, 1234, 15600, 1200000 |
| T2.4 | `linePath([])` returns an empty path without throwing; one value returns a single point; max value maps to the top padding, zero to the bottom; all points inside the box |

SQL, add to `supabase/tests/analytics.test.sql` using these fixtures (all inside the transaction, same time window):

- Session `s1aaaaaa`: pageview `/`, pageview `/join`.
- Session `s2bbbbbb`: pageview `/` only.
- Session `s3cccccc`: pageview `/`, `is_bot = true`.

| ID | Assertion |
|---|---|
| T2.5 | `analytics_overview`: visitors = 2, pageviews = 3 (bot excluded), bounce_rate = 50 (s2 is the single-page session), join_views = 1 |
| T2.6 | `analytics_timeseries` over 3 days returns 3 rows, the empty days with zeros (zero-fill works) |
| T2.7 | `analytics_top(..., 'path', 10)` returns `/` = 2 visitors, `/join` = 1. Passing `dim = 'id; drop table x'` raises an exception and runs nothing |
| T2.8 | As `anon`: every `analytics_*` function raises or is not executable. As non-admin `authenticated`: raises `42501`. As admin: returns data |
| T2.9 | A pageview at 23:30 IST and one at 00:30 IST the next day land in different day buckets |

Manual:

| ID | Check |
|---|---|
| T2.10 | Run `seed_analytics.sql`. `/admin/analytics` shows non-zero KPIs, a chart with 30 points, populated bar lists. Range 7, 30, 90 changes every number |
| T2.11 | Remove seed data. Page shows clear empty states, not NaN, Infinity or blank charts |
| T2.12 | Dashboard shows the traffic section and all pre-existing sections still render and behave as before |
| T2.13 | Resize to 375, 768 and 1280 px wide: no horizontal scroll, tiles reflow |
| T2.14 | Log in as a non-admin Supabase user: friendly message, no data, no console crash |
| T2.15 | Set `VITE_ANALYTICS_DEMO=true`, unset Supabase: page renders fixtures. Set `VITE_ANALYTICS_DEMO` off, Supabase unset: page says analytics is not configured |

Exit: T2.1 to T2.15 pass, build passes.

---

## Phase 3: Interaction tracking and Interest tab

Goal: see which events, sections and links get attention.

Tasks

1. `client/src/lib/analyticsTrack.js` (pure):
   - `findTrackTarget(node)` walks `parentElement` up to 6 levels and returns `{ name, target, slug }` from `data-track`, `data-track-target` and `data-track-slug`, or `null`. Accept plain objects with `parentElement` and `getAttribute` so tests need no DOM.
   - `isOutbound(href, siteHost)` true for `http(s)` links to another host, false for same host, `mailto:`, `tel:`, relative links and garbage input.
   - `createOnce()` returns `seen(key)` that is false the first time, true afterwards (for once-per-session impressions).
2. `analytics.js`: one delegated `click` listener on `document` (capture phase) that tracks `[data-track]` clicks and outbound links. One `IntersectionObserver` (threshold 0.5) for `[data-impression]` and `[data-section]`, using `createOnce` so each target fires once per session. Observe elements added later with a `MutationObserver`, or re-scan after each route change.
3. Add attributes (do not restyle anything):
   - `EventsPage.jsx:80` RSVP link: `data-track="registration" data-track-slug={e.slug}`.
   - `EventsPage.jsx` each `<article>`: `data-impression={'event:' + (e.slug || e.id)}`. Photos button: `data-track="gallery_open" data-track-slug={e.slug}`.
   - `TeamPage.jsx:55-56` GitHub and LinkedIn links: `data-track="team_github"` / `team_linkedin`, `data-track-slug` = member name slug.
   - Homepage banner CTA (find it in the layout or hero component; it is driven by `homepage_config.banner_link`): `data-track="banner_cta"`.
   - Homepage sections (`HeroSection`, `TaglineSection`, `WhyJoinSection`, `CirclesSection`, `HowItWorksSection`, `SpotlightSection`, FAQ section, `#join` CTA in `HomePage.jsx`): `data-section="hero|tagline|why|circles|how|spotlight|faq|cta"` on each root element.
   - Primary "Apply" buttons: `data-track="apply_cta" data-track-slug="<where>"`.
4. SQL: `analytics_interest(from, to)` returns per `target`: impressions (distinct sessions), clicks, ctr (clicks divided by impressions, null when 0), covering `event:*`, `section:*` and `click` targets.
5. UI: Interest tab with event impressions and RSVP CTR, homepage section reach (percent of visitor sessions that reached each section), other clicks table. Replace "event card opens" from the mockup with "event impressions".

Gate: tests

Unit, `client/src/lib/analyticsTrack.test.js`:

| ID | Assertion |
|---|---|
| T3.1 | `findTrackTarget` finds `data-track` on the node itself, on a parent 3 levels up, returns `null` past 6 levels or when absent |
| T3.2 | `isOutbound('https://github.com/x', 'cluster.org')` true; same host false; `mailto:a@b.c`, `tel:1`, `/events`, `#top`, `''`, `null` all false; `javascript:alert(1)` false |
| T3.3 | `createOnce`: first call false, second true, different keys independent |

SQL fixtures: 4 sessions. Three have `impression` `event:kickstart`; one of those also has `click` `registration` with `meta.slug = kickstart`. One session has `impression` `section:hero` only.

| ID | Assertion |
|---|---|
| T3.4 | `analytics_interest`: `event:kickstart` impressions = 3, `registration` clicks = 1, ctr about 33.3 |
| T3.5 | A target with 0 impressions returns `ctr = null`, not a divide-by-zero error |
| T3.6 | Duplicate impression rows from the same session count once (distinct sessions) |

Manual:

| ID | Check |
|---|---|
| T3.7 | `/events`: scrolling each card into view creates exactly one `impression` row per card, even after scrolling away and back |
| T3.8 | Click RSVP: one `click` row, `target = registration`, `meta.slug` equals the event slug; the new tab still opens normally |
| T3.9 | Click team GitHub and LinkedIn: `team_github` / `team_linkedin` rows. Click a footer link to another site: an `outbound` row with only the host in `meta`, not the full URL |
| T3.10 | Homepage: each section produces one `impression` row when about half visible; fast scrolling still records them |
| T3.11 | Interest tab matches the rows you just created (spot-check three numbers against the table editor) |
| T3.12 | Page performance unchanged: no layout shift, no noticeable scroll jank with the observer attached (Chrome Performance panel, 5-second scroll) |

Exit: T3.1 to T3.12 pass, build passes.

---

## Phase 4: Join funnel, attribution, Applicants tab

Goal: see where applicants drop off, which source produces them, and who is applying.

Tasks

1. SQL: `alter table public.applications add column if not exists source text; ... utm_campaign text;`. Add RPCs `analytics_funnel`, `analytics_source_conversion`, `analytics_applicants`.
2. Move `appToDB` / `appFromDB` out of `clusterDataService.js` into `client/src/lib/applicationMapper.js` (no Supabase import), add `source` and `utmCampaign`, and import them back. **Update the legacy fallback payload at `clusterDataService.js:~635`** so a missing-column retry still succeeds and does not lose the new fields silently (omit them there; the core fields must still insert).
3. `JoinPage.jsx`: add `track('form_step', 'join:view')` on mount, `join:start` on first input change, `join:field:<name>` on first focus of each field (use a delegated `onFocus` on the form), `join:submit` on successful submit. Pass first-touch `source` and `utm_campaign` (from `sessionStorage`) into `addApplication`. Do not put names, emails or roll numbers in any event.
4. Funnel definition (sessions, not events): view = pageview on `/join`; start = `join:start`; projects = `join:field:projects`; submit = `join:submit`. Abandonment by field = for sessions with `join:start` and no `join:submit`, the last `join:field:*` by `created_at`.
5. Applicants breakdown reads the `applications` table (branch, year, course, domain, status). Note: the table has no `status_changed_at`, so "average time in stage" is not computable. Either add `status_changed_at timestamptz` set by `updateApplicationStatus` (and a column in `appToDB`), or drop that column from the UI. Default: drop it for now and list it as a follow-up.
6. UI: Funnel tab (steps, drop-off percentages, abandonment note, conversion by source table) and Applicants tab (branch, year, status bars).

Gate: tests

Unit:

| ID | Assertion |
|---|---|
| T4.1 | `applicationMapper`: `appToDB` includes `source` and `utm_campaign`; `appFromDB(appToDB(x))` round-trips every field; missing `source` becomes `null` or empty string consistently |
| T4.2 | The legacy fallback payload still contains id, name, email, roll number, domain, branch_year, motivation, status (assert by reading it from an exported helper, not by running the service) |

SQL fixtures: 4 sessions on `/join`: A (view only), B (view, start, field projects), C (view, start, field github), D (view, start, field projects, submit). Insert 2 applications with `source = 'instagram'` and 1 with `source = 'qr-canteen'`; page_events for 5 instagram sessions and 2 qr sessions.

| ID | Assertion |
|---|---|
| T4.3 | `analytics_funnel`: view 4, start 3, projects 2, submit 1. Last-field abandonment: `projects` 1 (B), `github` 1 (C) |
| T4.4 | `analytics_source_conversion`: instagram visits 5, applicants 2, rate 40; qr-canteen visits 2, applicants 1, rate 50; a source with 0 visits does not divide by zero |
| T4.5 | `analytics_applicants` counts match a manual `group by` on the fixture applications |
| T4.6 | Re-running `analytics.sql` twice is a no-op (idempotent), including the `alter table` lines |

Manual:

| ID | Check |
|---|---|
| T4.7 | Submit a real test application from `/join?utm_source=ig&utm_campaign=poster1`. The `applications` row has `source = ig`, `utm_campaign = poster1`. The Supabase insert did not fall back to the legacy payload (check console for the warning) |
| T4.8 | Funnel rows appear for view, start, each focused field, submit. Nothing personal appears in `page_events` (inspect `meta` and `target` columns) |
| T4.9 | On a database without the new columns (simulate by running the app against the old schema), application submission still works |
| T4.10 | Funnel and Applicants tabs match table-editor counts. Empty ranges show empty states |
| T4.11 | Existing Applications admin page, CSV export and Google Sheets sync still work unchanged |

Exit: T4.1 to T4.11 pass, build passes. Owner then decides D2 (remove PostHog).

---

## Phase 5: Health tab, audit persistence, annotations, export, retention

Goal: operational view, chart annotations, CSV export, data purge.

Tasks

1. Persist audit logs: in `logAudit()` also `insert` into Supabase `audit_logs` (`id`, `action`, `summary`, `category`) when configured, best effort and non-blocking, localStorage kept as is. Add an admin read path in `analyticsService` (`getAuditRange`). Table columns are in `schema.sql`.
2. Chart annotations: for the visible range, draw dashed vertical markers for audit actions `HOMEPAGE_SYNC` and the applications-open toggle (inspect `clusterDataService` for the action name used when `applications_open` changes; add a `logAudit` call if none exists).
3. Web Vitals: add the `web-vitals` package (small, standard) and send LCP, CLS and INP once per page load as `vital` events with `meta.value`. This is the only new dependency in the plan.
4. Errors: `window.onerror` and `unhandledrejection` send `error` / `js` events with `meta.msg` cut to 200 chars, capped at 5 per session. In the catch-all route of `routes/index.jsx`, send `error` / `404` with the attempted path as `meta.path` before the existing redirect.
5. SQL: `analytics_health` (vitals p75 per metric, error counts, top 404 paths) and `analytics_purge(p_days)` (admin only, returns deleted row count).
6. Health tab: vitals tiles with thresholds (LCP good under 2.5 s, INP good under 200 ms, CLS good under 0.1), content freshness (last edit per category from persisted audit logs), 404 table, JS error count. Skip RSVP capacity: `event_rsvps` is described in `implementation.md` but is not in `schema.sql`. Leave a clearly labeled placeholder only if the table exists.
7. CSV export button on each tab. Add `toCsv(rows, columns)` to `analyticsFormat.js`.

Gate: tests

Unit:

| ID | Assertion |
|---|---|
| T5.1 | `toCsv` escapes commas, quotes and newlines; cells starting with `=`, `+`, `-` or `@` are prefixed with `'` (CSV formula injection); empty rows produce header only |
| T5.2 | Error throttle helper: sixth error in a session is dropped; messages over 200 chars are truncated |
| T5.3 | Vital rating helper: boundary values (2.5 s, 200 ms, 0.1) classify as documented |

SQL:

| ID | Assertion |
|---|---|
| T5.4 | `analytics_health` p75 of known vital values `[1,2,3,4]` equals the expected percentile; 404 paths ranked by count |
| T5.5 | `analytics_purge(90)` deletes only rows older than 90 days, returns the right count, and raises for non-admins |
| T5.6 | Audit insert as admin succeeds; as anon is denied |

Manual:

| ID | Check |
|---|---|
| T5.7 | Edit the homepage banner in admin: a row appears in Supabase `audit_logs`, and a dashed marker appears on the traffic chart at that day |
| T5.8 | Visit `/this-does-not-exist`: redirected home as before, and one `404` error row exists |
| T5.9 | Throw a test error from the console: one `js` row. Throw it 10 times: only 5 stored |
| T5.10 | Vitals rows appear once per page load and values look plausible (LCP in the hundreds to low thousands of ms) |
| T5.11 | CSV download opens cleanly in Excel and Google Sheets; a cell beginning with `=` shows as text |
| T5.12 | `analytics_purge` run from the SQL editor as admin with a seeded old row removes it |

Exit: T5.1 to T5.12 pass, build passes.

---

## Phase 6: Hardening and launch

Tasks

1. Abuse check: confirm that anon insert cannot exceed limits (T1.11 to T1.13), and that a script posting 10,000 rows is possible but bounded in effect by the retention purge and index sizes. Document the residual risk (Supabase anon inserts cannot be rate-limited without an edge function). If abuse appears, add a Vercel/Supabase edge function in front.
2. Performance: confirm the Analytics page loads in under 2 seconds against about 100k seeded rows (seed a larger fixture temporarily; check `explain analyze` on `analytics_timeseries` and `analytics_top` uses the indexes).
3. Docs: add a short "Analytics" section to `docs/ADMIN-CMS.md` (and fix its stale stack description if you are in there), document env vars in `.env.example`, document the SQL files and how to run the test script.
4. Privacy note: add one line to the public footer: "We count visits anonymously. No cookies, no personal data." Owner approves the wording first.
5. Decide D2 and, if removing PostHog, delete the snippet in `index.html`, the `window.posthog?.capture` call in `JoinPage.jsx`, and `VITE_POSTHOG_KEY` from `.env.example`.

Gate

| ID | Check |
|---|---|
| T6.1 | `npm test` and `npm run build` pass from a clean `npm ci` |
| T6.2 | Full SQL test script passes top to bottom on a fresh database |
| T6.3 | Production smoke test on the Vercel preview URL: visit the five public pages, confirm rows, confirm admin analytics loads with real data, confirm `/admin` generates no events |
| T6.4 | Lighthouse performance score on `/` is within 3 points of before the work (record the baseline in Phase 1) |
| T6.5 | No personal data in `page_events`: run `select * from page_events where path ~ '@' or target ~ '@' or meta::text ~ '@' limit 5;` and expect zero rows |

---

## 4. Who does what

| Step | Builder | Owner (Kurian) |
|---|---|---|
| Write all code, SQL files, tests, docs | Yes | |
| Run `analytics.sql`, seed and test scripts in the Supabase SQL Editor | Prepare them | Run them (builder needs Supabase access instead if Owner grants it) |
| Set `VITE_*` variables in Vercel and redeploy | | Yes |
| Decide D1 to D5 | | Yes |
| Confirm admin emails in `is_admin()` and fix the `user_metadata` clause | Can propose the SQL | Decide and apply |
| Check Supabase plan limits (database size, egress) | | Yes |
| Enable a schedule for `analytics_purge` (Supabase cron extension) | Provide the SQL | Enable it |
| Approve the footer privacy wording | | Yes |
| Print QR codes, post tagged links (for example `?utm_source=qr&utm_campaign=canteen`) | Provide a link builder in the panel if time allows | Yes. Attribution only works if tagged links are shared |
| Judge real traffic once live (bots, referrers look right) | Fix issues | Report anything odd |

---

## 5. Known limits (state these in the UI where relevant)

- "Visitors" are approximate: a new tab or device counts as a new session, so uniques are overcounted. Label the tile "Visitors (approx.)".
- Ad blockers and Do Not Track hide some visitors. Counts are a floor, not a total.
- Small audiences make percentages noisy. Always show the raw count next to a percentage.
- Bot filtering is user-agent based and imperfect.
- Day buckets use `Asia/Kolkata`.

## Appendix A: Differences from the approved mockup

- Interest tab: "event card opens" is "event impressions" (cards are not clickable).
- Applicants tab: "average time in stage" is omitted unless `status_changed_at` is added (Phase 4, task 5).
- Health tab: the RSVP versus capacity card is omitted until an `event_rsvps` table exists.
- Chart annotations depend on audit logs being persisted to Supabase (Phase 5, task 1). Before that, only the local browser's log exists.

## Appendix B: If D1 is Option B (PostHog)

Keep the PostHog snippet and use these changes instead of Phases 1 to 3's collector work:

- Add a Vercel serverless function `client/api/analytics.js` that verifies the caller's Supabase JWT against `is_admin()` and then queries PostHog's HogQL API using a personal API key stored as a Vercel env var (never `VITE_`-prefixed, or it ships to the browser). The admin UI calls this function instead of `supabase.rpc`.
- `data-track` and `data-section` attributes still apply; send them with `posthog.capture`.
- Applicant attribution: still store `source` and `utm_campaign` on `applications` from first-touch values, because PostHog data cannot be joined to Supabase rows.
- Review PostHog's query rate limits and the cookie or consent implications before choosing B.
- `analyticsFormat.js`, the UI components, the admin pages, and all unit tests for them are unchanged.
