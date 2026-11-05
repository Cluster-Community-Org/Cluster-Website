# CLUSTER — A Student Technology Society

> **Official Web Platform & Content Management Suite** for CLUSTER.  
> `BUILD` / `LEARN` / `COLLABORATE` / `CREATE` — Shaping the next generation of engineers and builders.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cluster--club.vercel.app-C6FF4D?style=for-the-badge&logo=vercel&logoColor=080808)](https://cluster-club.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-alwin2134%2FCluster-00E5FF?style=for-the-badge&logo=github&logoColor=080808)](https://github.com/alwin2134/Cluster)
[![Vite](https://img.shields.io/badge/Vite-6.4-C6FF4D?style=for-the-badge&logo=vite&logoColor=080808)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-00E5FF?style=for-the-badge&logo=react&logoColor=080808)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-C6FF4D?style=for-the-badge&logo=tailwindcss&logoColor=080808)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

---

## ⚡ Overview

**CLUSTER** is a premier student technology society dedicated to compute, systems engineering, AI/ML, full-stack architectures, and open-source software. 

This platform serves as both the **public digital headquarters** for students to discover events and apply for membership, and an **executive Admin Content Management System (CMS)** for society officers to orchestrate operations in real-time.

### 🌐 Live Deployment
The production app is live at: **[https://cluster-club.vercel.app/](https://cluster-club.vercel.app/)**

---

## ✨ Key Features

### 1. Public Experience
* **Cybernetic Visual Identity**: Designed strictly around obsidian dark `#080808` surfaces, Acid Lime `#C6FF4D`, and Cyber Cyan `#00E5FF` with crisp typography and subtle luminous borders.
* **Interactive 3D Circuit & Particle Canvas**: High-performance WebGL particle field and interactive circuit board backdrop.
* **Developer CLI Terminal**: Interactive terminal emulator (`cluster@society:~$`) with built-in command interpreter (`help`, `about`, `events`, `team`, `join`, `clear`).
* **Live Event Spotlight System**: Real-time countdown timer dynamically spotlights the society's flagship hackathon or workshop directly from the Admin CMS.
* **Dedicated Recruitment Portal (`/join` & `/apply`)**:
  * Comprehensive application form capturing domain interest, academic degree, engineering branch, graduation year, GitHub, LinkedIn, and motivation.
  * Instant application receipt generation with candidate reference ID.
  * **Pausable Recruitment State**: When closed by administrators, visitors see a sleek *"Not Accepting Applications Anymore"* notice preventing unsolicited submissions.
* **Events & RSVP System (`/events`)**:
  * Event cards with category filters, tags, dates, and locations.
  * Built-in instant RSVP modal with live registration counter.
* **Team Roster (`/team`)**:
  * Showcase of core leads, domain mentors, and alumni across Web, AI/ML, Cloud, and Design.

### 2. Admin Content Management System (CMS)
Accessible at **`/admin/dashboard`** with role-based access control:
* **Telemetry Dashboard (`/admin/dashboard`)**:
  * Quick metrics: Total events, active team roster, total applications, and recruitment cycle status.
  * Recent activity logs and direct shortcuts to society operations.
* **Events CMS (`/admin/events`)**:
  * Create, edit, and delete events.
  * Toggle any event as the **Homepage Spotlight** (`⭐ Make Spotlight`) with automatic live countdown sync.
  * Inspect registered RSVP participant rosters.
* **Team CMS (`/admin/team`)**:
  * Manage executive leads, core members, domain heads, and social links.
* **Applications & Recruitment Pipeline (`/admin/applications`)**:
  * **Master Recruitment Switch**: Open or pause admissions club-wide with one click.
  * **Candidate Pipeline Stages**: Track candidates across `Pending`, `Under Review`, `Accepted`, `Waitlisted`, and `Rejected`.
  * **Direct Email Contact**: Launch pre-filled email client to contact applicants directly.
  * **CSV Data Export**: One-click download of all applicant data for offline selection rounds.
  * **Real-time Google Sheets Sync**:
    * Connect any Google Sheet via an editable Google Apps Script Webhook URL (easily updated every academic year).
    * Automatically appends new applications into the Google Sheet.
    * Synchronizes status changes back to the Google Sheet with automatic cell color coding (e.g., `#C6FF4D` for Accepted, `#FFCDD2` for Rejected).
* **Homepage Configurator (`/admin/homepage`)**:
  * Edit hero headlines, subheadings, badge announcements, and official social media handles without redeploying code.

---

## 🎨 Design System

| Token | Name | Hex / Value | Description |
|---|---|---|---|
| `--color-bg` | Obsidian Dark | `#080808` | Primary page background |
| `--color-surface` | Deep Slate | `#0F1012` | Card & modal background |
| `--color-border` | Luminous White | `rgba(255, 255, 255, 0.08)` | Structural borders & dividers |
| `--color-acid` | Acid Lime | `#C6FF4D` | Primary accent, CTA buttons, active state |
| `--color-cyan` | Cyber Cyan | `#00E5FF` | Secondary accent & gradient end |
| `--font-display` | Syne / Space Grotesk | Display Font | Expressive headlines & titles |
| `--font-sans` | Inter | UI Font | High-legibility body typography |
| `--font-mono` | JetBrains Mono / Fira Code | Monospace | Terminal, timestamps, status badges |

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, Tailwind CSS 3.4, React Router 7, Lucide Icons
* **Animations & Canvas**: Canvas 2D particle simulation, interactive circuit backdrop, custom CSS glows
* **Persistence Layer**:
  * **Supabase (PostgreSQL)**: Cloud database for events, team, applications, and homepage configs.
  * **Reactive Client Service (`clusterDataService`)**: Provides seamless offline fallback to `localStorage` with window event broadcasting.
* **Integrations**:
  * **Google Sheets Webhook (Google Apps Script)**: Real-time applicant data ingestion and two-way status synchronization.

---

## 📂 Project Structure

```
Cluster/
├── client/                          # React + Vite Frontend
│   ├── public/                      # Static brand assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/                  # Circuit Canvas, Particle Field, Interactive Terminal
│   │   │   ├── layout/              # Navbar, Footer
│   │   │   ├── modals/              # JoinClusterModal, EventRSVPModal
│   │   │   └── sections/            # Hero, Pillars, Spotlight, Communities, Stats
│   │   ├── context/                 # ToastContext (global notification system)
│   │   ├── layouts/                 # PublicLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Society landing page
│   │   │   ├── EventsPage.jsx       # Event catalog with filters & RSVP
│   │   │   ├── TeamPage.jsx         # Core team and leads showcase
│   │   │   ├── JoinPage.jsx         # Dedicated /join recruitment application portal
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx    # Society metrics & overview
│   │   │       ├── AdminEvents.jsx       # Events CRUD & spotlight toggle
│   │   │       ├── AdminTeam.jsx         # Team roster management
│   │   │       ├── AdminApplications.jsx # Applicant pipeline & Google Sheets sync
│   │   │       ├── AdminHomepage.jsx     # Live homepage config editor
│   │   │       └── AdminLogin.jsx        # Admin authentication
│   │   ├── routes/                  # App routing with redirect handling
│   │   ├── services/                # clusterDataService (Supabase + localStorage fallback)
│   │   └── index.css                # Tailwind design system & animations
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── supabase/
│   └── schema.sql                   # Complete PostgreSQL schema & initial seed data
│
├── docs/                            # In-depth architectural & API specifications
│   ├── ADMIN-CMS.md
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── UI-DESIGN.md
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm** or **pnpm**
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/alwin2134/Cluster.git
cd Cluster
```

### 2. Configure Environment Variables
Inside the `client/` folder, create a `.env` file based on `.env.example`:

```bash
cp client/.env.example client/.env
```

Fill in your Supabase credentials (optional — the app gracefully falls back to local data if omitted):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

> **Note**: Never commit your `.env` file to version control.

### 3. Install Dependencies & Start Local Dev Server
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 4. Build for Production
```bash
npm --prefix client run build
```

---

## 📊 Google Sheets Webhook Setup (Optional)

To sync recruitment applications automatically into a Google Sheet:

1. Open your target **Google Sheet** and navigate to **Extensions → Apps Script**.
2. Paste the provided CLUSTER webhook script (which handles both new candidate insertions and `UPDATE_STATUS` actions).
3. Deploy as a **Web App** with access set to **"Anyone"**.
4. Copy the deployment URL.
5. In the Admin Portal, go to **`/admin/applications`**, click **"Connect Google Sheet"**, paste your URL, and test the connection.
6. The webhook link can be updated anytime per recruitment cycle or year without changing application code.

---

## 🔐 Admin Portal Access

1. Navigate to **`/admin/login`** (or click **"Admin Portal"** in the website footer).
2. Authenticate using administrator credentials or use demo mode.
3. Once logged in, manage events, team rosters, homepage copy, and incoming applications.

---

## 📜 Available Scripts

| Command | Working Directory | Purpose |
|---|---|---|
| `npm run dev` | `client/` | Runs local Vite dev server with Hot Module Replacement |
| `npm run build` | `client/` | Creates optimized production build in `client/dist/` |
| `npm run preview` | `client/` | Previews production build locally |
| `npm run lint` | `client/` | Runs ESLint analysis across codebase |

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License & Credits

Built with ⚡ by the **CLUSTER Student Technology Society**.  
*Galgotias University • Greater Noida, Uttar Pradesh, India.*
