import { Link } from 'react-router-dom'
import { Github, Linkedin, Instagram, Disc as Discord, ShieldCheck, MapPin, Mail, Sparkles } from 'lucide-react'
import ClusterLogo from '../ui/ClusterLogo.jsx'

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Ambient subtle glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cluster-acid/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ── Brand Column ── */}
          <div className="md:col-span-2 space-y-4">
            <ClusterLogo
              to="/"
              size="lg"
              showTagline={true}
              tagline="Good things happen in clusters."
            />

            <p className="text-xs text-gray-300 font-sans max-w-md leading-relaxed">
              A community around compute. Bringing together passionate tech students to build real projects, explore emerging technology, and foster shared curiosity.
            </p>

            {/* Core Values Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['Community', 'Collaboration', 'Belonging', 'Shared Curiosity'].map((val) => (
                <span
                  key={val}
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-obsidian-900 border border-white/10 text-gray-300 hover:border-cluster-acid hover:text-cluster-acid transition-colors"
                >
                  {val}
                </span>
              ))}
            </div>

            <div className="space-y-1.5 text-xs font-mono text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cluster-acid shrink-0" />
                <span>Greater Noida, UP 203201</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cluster-acid shrink-0" />
                <span>contact@clustersociety.tech</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {[
                { href: 'https://discord.gg', Icon: Discord, label: 'Discord Community' },
                { href: 'https://github.com/alwin2134/Cluster', Icon: Github, label: 'GitHub' },
                { href: 'https://linkedin.com', Icon: Linkedin, label: 'LinkedIn' },
                { href: 'https://instagram.com', Icon: Instagram, label: 'Instagram' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-obsidian-900 border border-white/10 text-gray-400 hover:text-cluster-acid hover:border-cluster-acid/40 flex items-center justify-center transition-all shadow-sm"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cluster-acid">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li><Link to="/" className="hover:text-cluster-acid transition-colors">Home</Link></li>
              <li><Link to="/team" className="hover:text-cluster-acid transition-colors">About & Leadership</Link></li>
              <li><Link to="/events" className="hover:text-cluster-acid transition-colors">Events & Meetups</Link></li>
              <li><Link to="/admin/login" className="hover:text-cluster-acid transition-colors text-gray-500 hover:text-cluster-acid">Admin Portal</Link></li>
            </ul>
          </div>

          {/* ── Focus Areas ── */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cluster-acid">
              What We Do
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li>Compute & AI Engineering</li>
              <li>Full-Stack Development</li>
              <li>Open Source Projects</li>
              <li>Hackathons & Build Sprints</li>
              <li>Study Circles & Tech Meetups</li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cluster-acid shrink-0" />
            <span>CLUSTER — Student Tech Community</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Good things happen in clusters.</span>
            <span className="w-2 h-2 rounded-sm bg-cluster-acid inline-block" />
          </div>
        </div>
      </div>
    </footer>
  )
}
