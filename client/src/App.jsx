import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ClusterPreloader } from './components/ui/ClusterLoader.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ClusterPreloader />
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}
