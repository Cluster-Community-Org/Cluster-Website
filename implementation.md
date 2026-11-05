# Implementation Plan: Event Blog & Dedicated Detail Pages (`/events/:slug`)

This document outlines the architectural specification and execution roadmap for adding dedicated, blog-style event pages with interactive RSVP/registrations to the CLUSTER web application.

---

## 1. Executive Summary & User Experience

Currently, events only exist as preview cards on `/events` with direct external links.  
This feature transforms each event into a **comprehensive editorial blog & event showcase page** (`/events/:slug`), providing:

- **Editorial Tech Blog Layout**: Long-form article explaining the context, problem statement, what attendees will build, prerequisites, and takeaways.
- **Adaptive Dual-Mode View**:
  - **Upcoming Mode**: Countdown timer, agenda timeline, speaker roster, seat capacity meter, and live RSVP action box.
  - **Past Recap Mode**: Transforms into a retrospective showcase featuring winning projects, photo gallery grid, slides, and recordings.
- **Hybrid Registration Flow**:
  - **Native On-Site RSVP**: Direct registration stored in Supabase (`event_rsvps`) with Course, Branch, Year, Roll Number, and GitHub.
  - **External Registration**: Seamless redirect for hackathons hosted on Devfolio, Unstop, or Luma.
- **Calendar & Social Sharing**: One-click "Add to Google Calendar", `.ics` download, and social share links.
- **Admin CMS Management**: Manage rich text content, agenda schedules, speaker profiles, and export attendee rosters to CSV.

---

## 2. Database Schema Specification (`supabase/schema.sql`)

### A. Extend `public.events` Table
Add columns to support long-form content, media, structured schedule, and registration mode:

```sql
-- Extend events table for editorial content & event management
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT,
ADD COLUMN IF NOT EXISTS agenda JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS speakers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 100,
ADD COLUMN IF NOT EXISTS rsvp_mode TEXT DEFAULT 'internal', -- 'internal' | 'external'
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
```

### B. Create `public.event_rsvps` Table
Store student registrations cleanly linked to specific events:

```sql
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id TEXT PRIMARY KEY,
  event_id INT REFERENCES public.events(id) ON DELETE CASCADE,
  event_slug TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  roll_number TEXT NOT NULL,
  course TEXT,
  branch TEXT,
  year TEXT,
  github TEXT,
  linkedin TEXT,
  status TEXT DEFAULT 'Confirmed', -- 'Confirmed' | 'Waitlisted' | 'Cancelled'
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for rapid lookups by event
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_slug ON public.event_rsvps(event_slug);
```

### C. Row-Level Security (RLS) Policies
```sql
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an RSVP (insert)
DROP POLICY IF EXISTS "Public RSVP insert access" ON public.event_rsvps;
CREATE POLICY "Public RSVP insert access" ON public.event_rsvps
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated admins can view, update, and manage all RSVPs
DROP POLICY IF EXISTS "Admin RSVP full access" ON public.event_rsvps;
CREATE POLICY "Admin RSVP full access" ON public.event_rsvps
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## 3. Frontend Architecture

### Route Hierarchy
```
/events                 -> EventsPage.jsx (List, filter, category tabs)
/events/:slug           -> EventDetailPage.jsx (Individual blog & RSVP showcase)
/admin/events           -> AdminEvents.jsx (Event editor, agenda/speakers, attendee export)
```

### Component Breakdown

```
client/src/
├── pages/
│   ├── EventDetailPage.jsx          # Master event blog page
│   └── EventsPage.jsx               # Updated: cards navigate to /events/:slug
├── components/
│   └── events/
│       ├── EventHero.jsx            # Banner, tags, title, date/time/venue breadcrumb
│       ├── EventContent.jsx         # Formatted editorial blog article
│       ├── EventAgenda.jsx          # Chronological schedule timeline
│       ├── EventSpeakers.jsx        # Grid of speakers, judges, and mentors
│       ├── EventRsvpSidebar.jsx     # Sticky action box (capacity, RSVP trigger, share)
│       ├── EventRecapGallery.jsx    # Photo grid for past events
│       └── EventRsvpModal.jsx       # Interactive registration dialog with validation
```

---

## 4. Data Layer (`client/src/services/clusterDataService.js`)

Enhance `clusterDataService` with:

1. **`getEventBySlug(slug)`**:
   - Retrieves event by slug from local cache, with automatic Supabase remote fetch fallback.
2. **`submitEventRSVP(rsvpData)`**:
   - Persists RSVP locally in `cluster_cms_event_rsvps` and dispatches `cluster_rsvps_updated`.
   - Sends payload to Supabase `event_rsvps` table.
3. **`getEventRSVPs(eventId)`**:
   - Returns attendee list for admin dashboards with CSV export support (`exportEventRSVPsCSV(eventId)`).
4. **Realtime Subscription**:
   - Subscribes to `event_rsvps` table changes via Supabase channel `cluster-rsvps-realtime`.

---

## 5. UI/UX & Design Guidelines

In accordance with `/taste` and `/ui-ux-pro-max`:
- **Color Palette**: Pitch obsidian background (`#080808`), slate surface (`#0F1012`), hairline borders (`border-white/[0.08]`), Acid Lime highlights (`#C6FF4D`), off-white typography (`#F8F7F3`).
- **Typography**: Display font for titles, monospace font for dates/badges/metrics, clean sans-serif for body reading with 1.7 line-height.
- **Sticky Ergonomics**: On desktop, the registration card sticks (`sticky top-24`) while the article scrolls naturally. On mobile, a bottom-docked sticky bar allows immediate registration without losing page context.
- **Empty & Loading States**: Clean skeleton loaders during hydration; graceful 404 page if a slug does not exist.

---

## 6. Phased Implementation Roadmap

| Phase | Milestone | Deliverables |
| :--- | :--- | :--- |
| **Phase 1** | **Database & Data Layer** | Apply SQL migration for `events` columns + `event_rsvps` table. Update `clusterDataService.js` with RSVP APIs and slug lookup. |
| **Phase 2** | **Public Event Page (`/events/:slug`)** | Build `EventDetailPage.jsx` with Hero, Blog Article, Agenda timeline, Speaker cards, and `EventRsvpModal.jsx`. Link cards from `/events`. |
| **Phase 3** | **Admin CMS & Attendees** | Update `/admin/events` with rich content editor, agenda manager, and attendee RSVP viewer with CSV export. |
| **Phase 4** | **Testing & Verification** | Test RSVP submission, calendar export, responsive mobile views, Supabase sync, and build verification. |

