import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/index.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  )
}
