import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { clusterDataService } from '../services/clusterDataService.js'
import { useToast } from '../context/ToastContext.jsx'
import { useLive } from '../hooks/useLive.js'
import { Corners, DotWave, PageHeader } from '../components/ui/Brand.jsx'
import { LiveChip } from '../components/sections/HeroSection.jsx'
import { STEPS } from '../components/sections/HowItWorksSection.jsx'

const DOMAINS = ['AI & Machine Learning', 'Full-Stack Web Dev', 'Mobile & Systems', 'Design & Creative Tech', 'Cloud & DevOps', 'Open Source & Dev Tools']
const COURSES = ['B.Tech', 'BCA', 'MCA', 'M.Tech', 'B.Sc Computer Science', 'Dual Degree (B.Tech + M.Tech)', 'Other Degree']
const BRANCHES = ['Computer Science & Engineering (CSE)', 'Information Technology (IT)', 'AI & Data Science (AIDS)', 'AI & Machine Learning (AIML)', 'Electronics & Communication (ECE)', 'Electrical & Electronics (EEE)', 'Mechanical Engineering', 'Other Branch']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate / Research']

const EMPTY = { fullName: '', email: '', rollNumber: '', course: COURSES[0], branch: BRANCHES[0], year: YEARS[0], domain: DOMAINS[0], github: '', projects: '', linkedin: '', motivation: '' }
const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 body-3 text-black placeholder:text-mute'

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="caption-3 text-graphite">{label}</span>
      {children}
      {hint && <span className="caption-5 text-graphite">{hint}</span>}
    </label>
  )
}

export default function JoinPage() {
  const { showToast } = useToast()
  const open = useLive('cluster_homepage_updated', () => clusterDataService.isApplicationsOpen())
  const [form, setForm] = useState(EMPTY)
  const [sent, setSent] = useState(null)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const app = clusterDataService.addApplication({ ...form, branchYear: `${form.course} · ${form.branch} · ${form.year}` })
    setSent(app)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    showToast(`Application sent. We will email ${app.email}.`, 'success')
  }

  return (
    <div className="px-4 sm:px-8 lg:px-20 pb-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        <PageHeader eyebrow="Apply to join" title={<>Show us what<br />you&apos;ve built</>}>
          Selection is on what you have done and where you want to go, not on grades, branch or year. Rough is fine.
        </PageHeader>

        {sent ? (
          <section aria-labelledby="sent-heading" className="relative overflow-hidden rounded-3xl bg-black text-white px-6 py-16 sm:p-16 flex flex-col items-center text-center gap-6">
            <DotWave className="bottom-0 h-56 opacity-50" single />
            <Corners inset="top-6 left-6 right-6 bottom-6" />
            <span className="relative w-16 h-16 rounded-2xl bg-lime text-black flex items-center justify-center rise"><Check className="w-8 h-8" /></span>
            <h2 id="sent-heading" className="relative heading-2 text-grad-dark rise" style={{ animationDelay: '100ms' }}>Application received</h2>
            <p className="relative title-2 text-soft max-w-lg rise" style={{ animationDelay: '200ms' }}>
              Thanks, {sent.fullName}. Circle leads read every application. You will hear back at {sent.email} once the round closes.
            </p>
            <dl className="relative w-full max-w-md rounded-2xl border border-char-2 bg-char-1 p-6 text-left grid grid-cols-2 gap-4 rise" style={{ animationDelay: '300ms' }}>
              <dt className="caption-3 text-mute">Reference</dt><dd className="title-4 font-mono text-lime text-right break-all">{sent.id}</dd>
              <dt className="caption-3 text-mute">Interest</dt><dd className="title-4 text-right">{sent.domain}</dd>
              <dt className="caption-3 text-mute">Status</dt><dd className="title-4 text-right">Received</dd>
            </dl>
            <div className="relative flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/events" className="btn btn-lime">See upcoming events <ArrowRight className="w-5 h-5" /></Link>
              <Link to="/" className="btn btn-ghost-dark">Back to home</Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-12 lg:grid-cols-12 items-start">
            <ol className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
              {STEPS.map(({ title, body }, i) => (
                <li key={title} className={`reveal ${['', 'reveal-2', 'reveal-3', 'reveal-3'][i]} rounded-2xl border p-6 flex gap-4 ${i === 0 ? 'border-black bg-white' : 'border-line'}`}>
                  <span className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center title-4 tabular-nums ${i === 0 ? 'bg-lime' : 'bg-black text-white'}`}>0{i + 1}</span>
                  <div className="flex flex-col gap-1">
                    <h2 className="title-2">{title}</h2>
                    <p className="body-6 text-graphite">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="lg:col-span-7">
              {!open ? (
                <section aria-labelledby="closed-heading" className="rounded-3xl border border-line bg-white p-8 sm:p-12 flex flex-col items-start gap-6">
                  <span className="w-12 h-12 rounded-lg bg-black text-lime flex items-center justify-center"><Lock className="w-6 h-6" /></span>
                  <h2 id="closed-heading" className="heading-3">Applications are closed for this round</h2>
                  <p className="title-2 text-graphite">Hackathons, open workshops, study circles and meetups stay open to every student all year. Come build with us there, and apply when the next round opens.</p>
                  <Link to="/events" className="btn btn-black">See upcoming events <ArrowRight className="w-5 h-5" /></Link>
                </section>
              ) : (
                <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-6 sm:p-10 flex flex-col gap-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="heading-5">Your application</h2>
                    <span className="bg-black rounded-full"><LiveChip open /></span>
                  </div>

                  <fieldset className="flex flex-col gap-6">
                    <legend className="title-3 pb-4">Start with the work</legend>
                    <Field label="What have you built, broken or shipped?" hint="Links welcome. Hackathon entries, class projects you took further, scripts, bots, PRs. A line on what each one was is enough.">
                      <textarea required rows={6} value={form.projects} onChange={set('projects')} className={`${field} resize-y`} placeholder="A Discord bot for the hostel mess menu. Broke twice, fixed both. github.com/you/mess-bot" />
                    </Field>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="GitHub or portfolio (optional)"><input type="url" value={form.github} onChange={set('github')} className={field} placeholder="https://github.com/you" /></Field>
                      <Field label="LinkedIn (optional)"><input type="url" value={form.linkedin} onChange={set('linkedin')} className={field} placeholder="https://linkedin.com/in/you" /></Field>
                    </div>
                    <Field label="What do you want to build next? (optional)">
                      <textarea rows={3} value={form.motivation} onChange={set('motivation')} className={`${field} resize-y`} placeholder="The thing you would start this semester if you had a team." />
                    </Field>
                    <Field label="Circle you're most interested in">
                      <select value={form.domain} onChange={set('domain')} className={field}>{DOMAINS.map((d) => <option key={d}>{d}</option>)}</select>
                    </Field>
                  </fieldset>

                  <fieldset className="flex flex-col gap-6 pt-8 border-t border-line">
                    <legend className="title-3 pb-4">Then a bit about you</legend>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="Full name"><input required autoComplete="name" value={form.fullName} onChange={set('fullName')} className={field} placeholder="Diya Patel" /></Field>
                      <Field label="Email"><input required type="email" autoComplete="email" value={form.email} onChange={set('email')} className={field} placeholder="diya@example.com" /></Field>
                      <Field label="Roll or student ID"><input required value={form.rollNumber} onChange={set('rollNumber')} className={`${field} font-mono`} placeholder="23SCSE102045" /></Field>
                      <Field label="Course"><select value={form.course} onChange={set('course')} className={field}>{COURSES.map((c) => <option key={c}>{c}</option>)}</select></Field>
                      <Field label="Branch"><select value={form.branch} onChange={set('branch')} className={field}>{BRANCHES.map((b) => <option key={b}>{b}</option>)}</select></Field>
                      <Field label="Year"><select value={form.year} onChange={set('year')} className={field}>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></Field>
                    </div>
                  </fieldset>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 border-t border-line">
                    <p className="body-6 text-graphite">Circle leads read every application.</p>
                    <button type="submit" className="btn btn-lime">Send application <ArrowRight className="w-5 h-5" /></button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
