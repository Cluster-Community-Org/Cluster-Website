import React from 'react'
import { Link } from 'react-router-dom'

export function ClusterMark({ className = 'w-9 h-9', markColor = '#F8F8F5', sparkColor = '#C6FF4D' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CLUSTER Logo Mark"
    >
      {/* 3 Radiant Accent Sparks (Acid Green #C6FF4D) */}
      <g fill={sparkColor}>
        <rect x="74" y="20" width="7.5" height="23" rx="3.75" transform="rotate(-15 77.75 31.5)" />
        <rect x="57" y="31" width="7.5" height="21" rx="3.75" transform="rotate(-40 60.75 41.5)" />
        <rect x="44" y="47" width="7.5" height="18" rx="3.75" transform="rotate(-65 47.75 56)" />
      </g>

      {/* Interlocking Hexagonal Chain */}
      <g stroke={markColor} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 72 52 L 100 52 L 126 78 L 104 100 L 80 100 L 70 90 L 92 68 L 72 68" />
        <path d="M 88 108 L 60 108 L 34 82 L 56 60 L 80 60 L 90 70 L 68 92 L 88 92" />
      </g>
    </svg>
  )
}

export default function ClusterLogo({
  to = '/',
  size = 'md',
  showText = true,
  showTagline = false,
  showDivider = true,
  tagline = 'Good things happen in clusters.',
  theme = 'dark',
  className = '',
}) {
  const isLight = theme === 'light'
  const markColor = isLight ? '#000000' : '#F8F8F5'
  const textColor = isLight ? 'text-black' : 'text-[#F8F8F5]'
  const dividerColor = isLight ? 'bg-black/25' : 'bg-white/20'

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }

  const markSize = sizeClasses[size] || sizeClasses.md

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Logo Mark container */}
      <div className="relative shrink-0 flex items-center justify-center p-0.5">
        <ClusterMark
          className={`${markSize} transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(198,255,77,0.35)]`}
          markColor={markColor}
          sparkColor="#C6FF4D"
        />
      </div>

      {/* Vertical Brand Lockup Divider (matches official brand lockup) */}
      {showText && showDivider && (
        <span className={`w-[1px] h-6 ${dividerColor} hidden sm:inline-block`} aria-hidden="true" />
      )}

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-display font-black text-lg sm:text-xl tracking-wider ${textColor} leading-none`}>
              CLUSTER
            </span>
            <span className="w-1.5 h-1.5 rounded-sm bg-[#C6FF4D] inline-block shadow-[0_0_8px_#C6FF4D]" />
          </div>
          {showTagline && (
            <span className="text-[10px] font-mono text-gray-400 tracking-wider mt-0.5">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  )

  if (to) {
    return <Link to={to} className="focus:outline-none">{content}</Link>
  }

  return content
}
