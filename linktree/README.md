# CLUSTER — Official Linktree & Socials Hub

A sleek, responsive, neo-brutalist link hub inspired by [`gdg-socials.vercel.app`](https://gdg-socials.vercel.app/), crafted specifically for **CLUSTER Community Society** (Galgotias University // NVIDIA DGX H200).

---

## 🚀 Features

- **2-Column Responsive Layout**: Beautiful 2-column tactile button cards on desktop/tablet, collapsing cleanly to 1 column on mobile (matching `gdg-socials`).
- **NVIDIA & CLUSTER Aesthetic**: Deep space obsidian theme (`#080808`), subtle 36px background grid, and high-impact Acid Lime (`#C6FF4D`) and NVIDIA Green (`#76B900`) corner geometric accents.
- **Official Channels Included**:
  - 🌐 Official Website
  - 🚀 Fall 2026 Recruitment & Applications (`/join`)
  - 📅 Events & Hackathons (`/events`)
  - 💬 Discord Server
  - 📱 WhatsApp Announcement Community
  - 💼 LinkedIn Page
  - 📸 Instagram Profile
  - 🐦 X (Twitter)
  - 💻 GitHub Organization
  - 👥 Meet the Team & Circles (`/team`)
- **Interactive QR Code Generator**: Built-in modal generates a high-contrast Acid Lime QR code ready for phone scanning at offline club orientations, booth fairs, and hackathons.
- **1-Click Share & Copy**: Uses Web Share API with clipboard copy fallback and toast feedback.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install --prefix linktree
```
*(or `cd linktree && npm install`)*

### 2. Start Dev Server
```bash
npm --prefix linktree run dev
```
*(Runs on `http://localhost:5174`)*

### 3. Build for Production
```bash
npm --prefix linktree run build
```

---

## 🌐 Deploying to Vercel (Independent Subdomain / Project)

Just like `gdg-socials.vercel.app`, you can deploy this folder directly to Vercel as a standalone project (e.g., `cluster-socials.vercel.app` or `links.clustersociety.tech`):

1. Go to your [Vercel Dashboard](https://vercel.com/new).
2. Import the `Cluster-Website` GitHub repository.
3. In **Project Configuration**:
   - **Root Directory**: Click `Edit` and select `linktree`.
   - **Framework Preset**: `Vite` (auto-detected).
4. Click **Deploy**!

---

## ✏️ Customizing Links

To add, edit, or reorder links, simply modify `linktree/src/data/links.js`:

```javascript
export const SOCIAL_LINKS = [
  {
    id: 'custom-link',
    title: 'Your Title',
    subtitle: 'Your Subtitle',
    url: 'https://...',
    iconType: 'globe', // 'discord', 'whatsapp', 'linkedin', 'instagram', 'x', 'github', 'rocket', 'calendar', 'users'
    bgClass: 'bg-[#C6FF4D] text-black border-2 border-black',
    badge: 'New', // optional
  },
  // ...
]
```

