import { BrowserRouter, useLocation } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ClusterPreloader } from './components/ui/ClusterLoader.jsx'

// Preloader is active exclusively in local development / localhost
const isLocalDev =
  Boolean(import.meta.env.DEV) ||
  (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.localhost')))

function AppContent() {
  const location = useLocation()
  const isAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/r/')

  return (
    <>
      {isLocalDev && !isAdmin && <ClusterPreloader />}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <AppRoutes />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  )
}
