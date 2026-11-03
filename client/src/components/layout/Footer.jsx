import { Link } from 'react-router-dom'
import { Github, Linkedin, Instagram, Disc as Discord, ShieldCheck, MapPin, Mail } from 'lucide-react'

// CLUSTER official logo asset from brand kit
const LOGO_URL = "/cluster-logo.jpg"

export default function Footer() {
  return (
    <footer className="relative bg-obsidian-950 border-t border-cluster-green/20 pt-16 pb-12 overflow-hidden">
      {/* Ambient green/cyan glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cluster-green/8 blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-cluster-cyan/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ── Brand Column ── */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-cluster-green/40 p-1 flex items-center justify-center shrink-0 shadow-cluster-glow">
                <img
                  src={LOGO_URL}
                  alt="CLUSTER Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg sm:text-xl text-white tracking-widest leading-none">
                  CLUSTER
                </span>
                <span className="text-[9px] font-mono text-cluster-green uppercase tracking-[0.2em] font-semibold mt-0.5">
                  A Student Technology Society
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 font-sans max-w-md leading-relaxed">
              The official student technology society at Galgotias University — dedicated to building real projects, learning together, collaborating across disciplines, and creating the future of technology.
            </p>

            <div className="space-y-1.5 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cluster-green shrink-0" />
                <span>Plot No. 2, Sector 17-A, Yamuna Expressway, Greater Noida, UP 203201</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cluster-green shrink-0" />
                <span>cluster@galgotiasuniversity.edu.in</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {[
                { href: 'https://discord.gg', Icon: Discord, label: 'Discord Community' },
                { href: 'https://github.com', Icon: Github, label: 'GitHub' },
                { href: 'https://linkedin.com', Icon: Linkedin, label: 'LinkedIn' },
                { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-obsidian-900 border border-white/10 text-gray-400 hover:text-cluster-green hover:border-cluster-green/40 flex items-center justify-center transition-all shadow-sm"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cluster-green">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li><Link to="/" className="hover:text-cluster-green transition-colors">Home</Link></li>
              <li><Link to="/team" className="hover:text-cluster-green transition-colors">About & Leadership</Link></li>
              <li><Link to="/events" className="hover:text-cluster-green transition-colors">Events & Workshops</Link></li>
              <li><Link to="/admin/login" className="hover:text-cluster-green transition-colors text-gray-500 hover:text-cluster-green">Admin Portal</Link></li>
            </ul>
          </div>

          {/* ── Focus Areas ── */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cluster-green">
              What We Do
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li>Web & App Development</li>
              <li>AI & Machine Learning</li>
              <li>Open Source Projects</li>
              <li>Hackathons & Competitions</li>
              <li>Workshops & Study Circles</li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cluster-green shrink-0" />
            <span>Official Student Organization of Galgotias University.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Crafted by <span className="text-cluster-green font-bold">CLUSTER</span> — Build · Learn · Collaborate · Create</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
