import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import HomePage from '../pages/HomePage.jsx'
import EventsPage from '../pages/EventsPage.jsx'
import TeamPage from '../pages/TeamPage.jsx'
import JoinPage from '../pages/JoinPage.jsx'

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import AdminEvents from '../pages/admin/AdminEvents.jsx'
import AdminTeam from '../pages/admin/AdminTeam.jsx'
import AdminApplications from '../pages/admin/AdminApplications.jsx'
import AdminHomepage from '../pages/admin/AdminHomepage.jsx'
import AdminSocials from '../pages/admin/AdminSocials.jsx'

function ExternalRedirect({ to }) {
  useEffect(() => {
    window.location.replace(to)
  }, [to])
  return null
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/apply" element={<Navigate to="/join" replace />} />
      </Route>

      {/* Redirects to standalone Linktree site */}
      <Route path="/socials" element={<ExternalRedirect to="https://cluster-socials.vercel.app/" />} />
      <Route path="/links" element={<ExternalRedirect to="https://cluster-socials.vercel.app/" />} />

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Protected Dashboard Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="socials" element={<AdminSocials />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
