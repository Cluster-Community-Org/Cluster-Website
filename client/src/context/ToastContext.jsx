import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext({
  showToast: () => {},
})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const newToast = { id, message, type }

    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  // Support global custom event dispatch as well
  useEffect(() => {
    const handleCustomToast = (e) => {
      if (e.detail?.message) {
        showToast(e.detail.message, e.detail.type || 'success', e.detail.duration || 3500)
      }
    }
    window.addEventListener('cluster_toast', handleCustomToast)
    return () => window.removeEventListener('cluster_toast', handleCustomToast)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success'
          const isError = toast.type === 'error'

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0F1012] border border-white/[0.12] shadow-2xl text-[#F8F7F3] text-xs font-mono animate-fadeIn"
              style={{
                borderColor: isSuccess ? 'rgba(198,255,77,0.4)' : isError ? 'rgba(239,68,68,0.4)' : 'rgba(56,189,248,0.4)',
              }}
            >
              <div className="flex items-center gap-2.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-cluster-acid shrink-0" />}
                {isError && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                {!isSuccess && !isError && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
                <span className="leading-snug">{toast.message}</span>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-white p-0.5 rounded transition-colors shrink-0 cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
