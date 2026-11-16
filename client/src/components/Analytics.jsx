import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageview, scanTrackableElements } from '../lib/analytics.js'

export default function Analytics() {
  const location = useLocation()
  const prevPathRef = useRef(null)

  useEffect(() => {
    // Only track when pathname actually changes
    const currentPath = location.pathname
    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath
      trackPageview()
    }
    // Re-scan trackable impression elements whenever route or query changes
    const timer = setTimeout(() => {
      scanTrackableElements()
    }, 150)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  return null
}
