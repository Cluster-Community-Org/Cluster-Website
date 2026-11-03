# CLUSTER — A Student Technology Society

> **Official Website & Content Management System** for CLUSTER at Galgotias University.  
> `BUILD` / `LEARN` / `COLLABORATE` / `CREATE` — Create Your Future in Tech.

[![Repository](https://img.shields.io/badge/GitHub-alwin2134%2FCluster-00E5FF?style=flat-square&logo=github)](https://github.com/alwin2134/Cluster)
[![Vite](https://img.shields.io/badge/Vite-6.4-A3FF6B?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-00E5FF?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-A3FF6B?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

---

## Overview

**CLUSTER** is the premier student technology society at **Galgotias University**, built to empower students to build production-grade projects, explore emerging technologies (AI/ML, Web3, Full-Stack, Cloud Systems), and collaborate across disciplines.

The official platform pairs an immersive, cybernetic front-end experience with a comprehensive **Admin CMS** for real-time society operations.

### Key Highlights
* **Cybernetic Visual Identity**: Tailored around the official CLUSTER Brand Kit with high-contrast dual-gradient branding (`#A3FF6B` Cluster Green to `#00E5FF` Cluster Cyan) on an obsidian dark surface (`#0B0F14`).
* **Interactive 3D & Particle Canvas**: High-performance WebGL particle field and interactive circuit canvas.
* **Interactive CLI Terminal**: Functional developer terminal emulator (`cluster@society:~$`) with custom command parser (`help`, `about`, `events`, `team`, `join`, `clear`).
* **Live Event Spotlight System**: Real-time countdown timer on the homepage dynamically controlled from the Admin CMS.
* **Integrated Admin CMS**: Full management portal for executive officers to curate events, spotlight competitions, and manage core team rosters.

---

## Visual Identity & Design System

| Element | Specification | Hex / Value |
|---------|---------------|-------------|
| **Brand Gradient** | Cluster Green → Cluster Cyan | `linear-gradient(135deg, #A3FF6B 0%, #00E5FF 100%)` |
| **Accent Colors** | Lime, Cyan, Violet, Pink, Amber | `#C6FF4D`, `#00FFC2`, `#A78BFA`, `#FF5CA8`, `#FFD166` |
| **Dark Background** | Deep Obsidian | `#0B0F14` |
| **Surfaces** | Surface 1 / Surface 2 | `#111827`, `#1F2937` |
| **Text Colors** | Primary Text / Muted Text | `#E5E7EB` / `#94A3B8` |
| **Headings Font** | Space Grotesk | Display & Hero typography |
| **Body & UI Font** | Inter | Readable modern UI sans-serif |
| **Monospace Font** | Fira Code | Terminals, dates, badges & metrics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, React Router DOM, Lucide Icons |
| **Canvas / Motion** | Canvas 2D / WebGL Particles, Lucide React, Framer-motion ready |
| **State & Sync** | Reactive `clusterDataService` with `localStorage` fallback & live event dispatching |
| **Backend (Ready)** | Node.js, Express.js |
| **Database (Ready)** | MongoDB (Mongoose ODM) |
| **Auth & Security** | JWT, Passport.js (Google & GitHub OAuth 2.0), Role-based Access Control |

---

## Project Structure

```
Cluster/
├── client/                          # Frontend application (React + Vite)
│   ├── public/                      # Static assets (cluster-logo.jpg, cluster-banner.jpg, favicon.svg)
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/                  # Circuit Canvas, Particle Field, Interactive Terminal
│   │   │   ├── layout/              # Navbar, Footer
│   │   │   └── sections/            # Hero, About (4 Pillars), Stats, Spotlight, Communities, CTA
│   │   ├── layouts/                 # PublicLayout, AdminLayout
│   │   ├── pages/                   # HomePage, EventsPage, TeamPage
│   │   │   └── admin/               # AdminDashboard, AdminEvents, AdminTeam, AdminLogin
│   │   ├── routes/                  # React Router configuration
│   │   ├── services/                # clusterDataService (live sync layer)
│   │   └── styles/                  # Tailwind CSS, cluster glow variables
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Backend API (Node.js + Express)
│   ├── config/                      # Database & Passport configuration
│   ├── controllers/                 # Events, Team, Applications controllers
│   ├── middleware/                   # JWT & Admin role verification
│   ├── routes/                      # REST endpoints
│   ├── index.js                     # Server entrypoint
│   └── package.json
│
├── docs/                            # Documentation & Architecture
│   ├── ADMIN-CMS.md                 # Admin CMS operational guide
│   ├── ARCHITECTURE.md              # System design
│   ├── API.md                       # API reference
│   └── SPRINTS.md                   # Development sprint backlog
│
└── README.md
```

---

## Getting Started

### Prerequisites
* **Node.js**: v18.0.0 or later (v20+ LTS recommended)
* **npm** or **pnpm**
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/alwin2134/Cluster.git
cd Cluster
```

### 2. Run the Client (Frontend)
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Production Build
```bash
npm --prefix client run build
```

---

## Admin Portal Access

The website includes a built-in content management suite accessible by administrators:

1. Navigate to **`/admin/login`** (or click **"Admin Portal"** in the footer).
2. Sign in with administrator credentials (or click SSO demo access).
3. **Features available:**
   * **Dashboard (`/admin/dashboard`)**: Society metrics, active counts, and recent activity logs.
   * **Events CMS (`/admin/events`)**: Create/edit events, filter categories, and toggle any event as the **Homepage Spotlight** (`⭐ Make Spotlight`) with a real-time countdown.
   * **Team CMS (`/admin/team`)**: Manage core officers, executive board positions, and social profiles.

---

## Available Scripts

### Client (`client/`)
| Command | Purpose |
|---|---|
| `npm run dev` | Starts Vite dev server with hot reload |
| `npm run build` | Generates optimized production build in `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs ESLint check across client files |

---

## Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feat/membership-portal`).
3. Commit your changes (`git commit -m 'feat: add applicant status pipeline'`).
4. Push to the branch (`git push origin feat/membership-portal`).
5. Open a Pull Request.

---

## License & Credits

Built with ⚡ by the **CLUSTER Student Technology Society**  
**Galgotias University** • Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, UP 203201.
