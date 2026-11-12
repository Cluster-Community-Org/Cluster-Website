import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ClusterMark } from '../components/ui/Brand.jsx'
import { ClusterSpinner } from '../components/ui/ClusterLoader.jsx'
import { clusterDataService } from '../services/clusterDataService.js'

export default function QRRedirect() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Resolving link...')

  useEffect(() => {
    if (!slug) {
      navigate('/', { replace: true })
      return
    }

    let isMounted = true

    const handleRedirect = async () => {
      try {
        const destination = await clusterDataService.resolveAndRecordQRScan(slug)
        if (!isMounted) return

        if (destination) {
          setStatus('Redirecting...')
          // Immediate clean redirect to destination
          window.location.replace(destination)
        } else {
          // Fallback: check if slug matches any event or route directly
          if (slug === 'home') window.location.replace('/')
          else if (slug === 'join') window.location.replace('/join')
          else if (slug === 'socials') window.location.replace('https://cluster-socials.vercel.app/')
          else {
            setStatus('Link not found, redirecting home...')
            setTimeout(() => {
              if (isMounted) navigate('/', { replace: true })
            }, 1500)
          }
        }
      } catch (e) {
        console.error('[QR Redirect Error]', e)
        if (isMounted) navigate('/', { replace: true })
      }
    }

    handleRedirect()

    return () => {
      isMounted = false
    }
  }, [slug, navigate])

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#141413] border border-white/10 flex items-center justify-center mb-6 shadow-xl">
        <ClusterMark className="w-9 h-9" animated />
      </div>

      <h1 className="text-xl font-bold tracking-tight text-[#F8F7F3] mb-2 flex items-center gap-2.5">
        <ClusterSpinner className="w-4 h-4 text-[#C6FF4D]" />
        {status}
      </h1>

      <p className="text-xs text-[#888] font-mono mt-1">
        CLUSTER Tracked QR Dispatch · <span className="text-[#C6FF4D]">/r/{slug}</span>
      </p>
    </div>
  )
}

