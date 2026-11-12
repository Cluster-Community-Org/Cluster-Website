import { useState, useEffect } from 'react'
import { ClusterMark } from './Brand.jsx'

/**
 * ClusterLoader — Minimalist pure brand loader on signature light paper background.
 * Free of window containers, cards, text, and progress bars.
 * Features the iconic Cluster mark with animated sequential sparks.
 */
export function ClusterLoader({
  className = '',
  size = 'lg',
  theme = 'paper', // 'paper' (#F3EFE4) | 'dark' (#080808) | 'white' (#FFFFFF)
}) {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  }

  const logoSize = sizeMap[size] || sizeMap.lg
  const isDark = theme === 'dark'

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Soft Luminous Backlight Aura */}
      <div
        className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full pointer-events-none -z-10 ${
          isDark ? 'bg-[#C6FF4D]/[0.12] blur-3xl' : 'bg-[#C6FF4D]/[0.25] blur-3xl'
        }`}
      />

      {/* Pure Logo Emblem with Vibrant Sequential Sparks */}
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
 * Cinematic Snap, Bounce & Downward Exit Preloader
 * 1. Phase 1 (Fullscreen): Sequential glowing sparks ignite (Spark 1 -> Spark 2 -> Spark 3).
 * 2. Phase 2 (Inward Shrink): The background visibly contracts inward frame-by-frame 
 *    from all 4 screen edges into the shape of the centered square box, revealing the website around it.
 * 3. Phase 3 (Bounce): The square box does an elastic Roblox TweenService spring bounce.
 * 4. Phase 4 (Downward Exit): The box hops up and drops smoothly downward through the bottom of the screen.
 * 
 * Exclusively active on localhost / dev environment. Completely stripped on production.
 */
export function ClusterPreloader({ forceShow = false, onComplete }) {
  const isAdminPath =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') ||
      window.location.pathname.startsWith('/r/'))

  // Hard stop: Never render on admin or redirect pages unless explicitly forceShown
  if (isAdminPath && !forceShow) return null

  // Phases: 'fullscreen' -> 'shrinking' -> 'bouncing' -> 'dropping' -> 'done'
  const [phase, setPhase] = useState('fullscreen')
  const [iteration, setIteration] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__clusterPreloaderActive = true
    }

    // 1. Fullscreen spark glow sequence: 1 -> 2 -> 3 spark pulse wave (1800ms)
    const shrinkTimer = setTimeout(() => {
      setPhase('shrinking')
    }, 1800)

    // 2. Visible inward shrink: background contracts inward frame-by-frame (1000ms)
    const bounceTimer = setTimeout(() => {
      setPhase('bouncing')
    }, 2800)

    // 3. Roblox TweenService spring bounce settles, then downward drop exit (3450ms)
    const dropTimer = setTimeout(() => {
      setPhase('dropping')
      if (typeof window !== 'undefined') {
        window.__clusterPreloaderActive = false
        window.dispatchEvent(new CustomEvent('cluster-loader-done'))
      }
    }, 3450)

    // 4. Completed downward exit, unmount (4150ms)
    const doneTimer = setTimeout(() => {
      setPhase('done')
      if (typeof window !== 'undefined') {
        window.__clusterPreloaderActive = false
      }
      if (typeof onComplete === 'function') {
        onComplete()
      }
    }, 4150)

    return () => {
      clearTimeout(shrinkTimer)
      clearTimeout(bounceTimer)
      clearTimeout(dropTimer)
      clearTimeout(doneTimer)
      if (typeof window !== 'undefined') {
        window.__clusterPreloaderActive = false
      }
    }
  }, [iteration])

  // Dev helper: allow replaying the preloader on command
  useEffect(() => {
    window.__replayClusterLoader = () => {
      setPhase('fullscreen')
      setIteration((prev) => prev + 1)
    }
    window.__setClusterPreloaderPhase = (p) => {
      setPhase(p)
    }
    return () => {
      delete window.__replayClusterLoader
      delete window.__setClusterPreloaderPhase
    }
  }, [])

  if (phase === 'done') return null

  const isFullscreen = phase === 'fullscreen'
  const isShrunkOrMore = phase !== 'fullscreen'
  const hasFormedBox = phase === 'bouncing' || phase === 'dropping'
  const isBouncing = phase === 'bouncing'
  const isDropping = phase === 'dropping'

  return (
    <div
      data-preloader="true"
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden select-none"
      aria-live="polite"
      aria-busy={phase !== 'done'}
    >
      {/* 1. Fullscreen Backdrop Curtain that visibly shrinks inward to the 160px square */}
      {phase !== 'dropping' && (
        <div
          className={`fixed inset-0 bg-[#F3EFE4] preloader-curtain ${
            isShrunkOrMore ? 'preloader-curtain-shrunk' : ''
          } ${phase === 'bouncing' ? 'opacity-0 transition-opacity duration-200' : 'opacity-100'}`}
        />
      )}

      {/* 2. Centered 160px Square Box Tile */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        <div
          data-preloader-tile="true"
          className={`w-[160px] h-[160px] rounded-[32px] bg-[#F3EFE4] flex items-center justify-center relative ${
            hasFormedBox
              ? 'border-2 border-[#141413] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.32)]'
              : 'border-0 shadow-none'
          } ${isBouncing ? 'tile-bounce' : ''} ${isDropping ? 'tile-drop-exit' : ''}`}
        >
          {/* Subtle inner corner accent when tile is formed */}
          {hasFormedBox && (
            <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-[30px]" />
          )}

          {/* Logo with 1 -> 2 -> 3 Glowing Sparks */}
          <ClusterMark
            className="w-20 h-20 sm:w-24 sm:h-24"
            markColor="#141413"
            sparkColor="#C6FF4D"
            animated={true}
          />
        </div>
      </div>
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
