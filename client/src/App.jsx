import { useState, useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ClusterPreloader } from './components/ui/ClusterLoader.jsx'
import { clusterDataService } from './services/clusterDataService.js'

function AppContent() {
  const location = useLocation()
  const isAdmin =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/r/')

  const [homepageConfig, setHomepageConfig] = useState(() =>
    clusterDataService.getHomepageConfig()
  )

  useEffect(() => {
    const handleConfigUpdate = () => {
      setHomepageConfig(clusterDataService.getHomepageConfig())
    }
    window.addEventListener('cluster_homepage_updated', handleConfigUpdate)
    return () => {
      window.removeEventListener('cluster_homepage_updated', handleConfigUpdate)
    }
  }, [])

  // Controlled by Admin Homepage CMS config (enabled for production & local; strictly bypassed on admin & redirects)
  const isLoaderActive = Boolean(homepageConfig?.loaderEnabled !== false)

  return (
    <>
      {isLoaderActive && !isAdmin && <ClusterPreloader />}
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
