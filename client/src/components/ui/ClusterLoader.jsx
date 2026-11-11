import { useState, useEffect } from 'react'
import { ClusterMark } from './Brand.jsx'

/**
 * ClusterLoader — Minimalist pure brand loader on signature light paper background.
 * Free of window containers, cards, text, and progress bars.
 * Features the iconic Cluster mark with animated sequential sparks from Linktree.
 */
export function ClusterLoader({
  className = '',
  size = 'lg',
  theme = 'paper', // 'paper' (#F3EFE4) | 'dark' (#080808) | 'white' (#FFFFFF)
}) {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-28 h-28 sm:w-36 sm:h-36',
    xl: 'w-36 h-36 sm:w-44 sm:h-44',
  }

  const logoSize = sizeMap[size] || sizeMap.lg
  const isDark = theme === 'dark'

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft Luminous Backlight Aura */}
      <div
        className={`absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full pointer-events-none -z-10 ${
          isDark ? 'bg-[#C6FF4D]/[0.12] blur-3xl' : 'bg-[#C6FF4D]/[0.25] blur-3xl'
        }`}
      />

      {/* Pure Logo Emblem with Exact Linktree Animated Sparks */}
      <div className="relative select-none">
        <ClusterMark
          className={logoSize}
          markColor={isDark ? '#F8F7F3' : '#141413'}
          sparkColor="#C6FF4D"
          animated={true}
        />
      </div>
    </div>
  )
}

/**
 * ClusterPreloader — Full-screen initial page entrance preloader.
 * Clean, signature light paper background (#F3EFE4) matching the site's editorial theme.
 * Completely free of window containers, progress bars, and text.
 * Auto-dismisses smoothly after initial page mount.
 */
export function ClusterPreloader({ minDuration = 0, theme = 'paper', forceShow = false }) {
  const [visible, setVisible] = useState(true)
  const [rendered, setRendered] = useState(true)

  useEffect(() => {
    if (forceShow) return

    // Immediately trigger fadeout on initial mount with zero artificial waiting
    const timer = setTimeout(() => {
      setVisible(false)
      const unmountTimer = setTimeout(() => {
        setRendered(false)
      }, 400) // matches transition duration
      return () => clearTimeout(unmountTimer)
    }, minDuration)

    return () => clearTimeout(timer)
  }, [minDuration, forceShow])

  if (!rendered) return null

  const bgClass =
    theme === 'dark' ? 'bg-[#080808]' : theme === 'white' ? 'bg-white' : 'bg-[#F3EFE4]'

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ease-out select-none ${bgClass} ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-live="polite"
      aria-busy={visible}
    >
      <ClusterLoader size="lg" theme={theme} />
    </div>
  )
}

/**
 * ClusterSpinner — Compact inline icon loader for buttons and badges
 */
export function ClusterSpinner({
  className = 'w-5 h-5',
  markColor = 'currentColor',
  sparkColor = '#C6FF4D',
}) {
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <ClusterMark
        className="w-full h-full"
        markColor={markColor}
        sparkColor={sparkColor}
        animated={true}
      />
    </div>
  )
}

export default ClusterLoader
