// VicmargLogo — inline SVG brand mark.
// Matches the official VICMARG logo: metallic V, orbital rings, signal arcs.
// Replace <VicmargLogoImage> with <Image src="/images/logo.png"> once PNG is in public/.
// Size variants: 'sm' = 28px, 'md' = 44px, 'lg' = 80px, 'xl' = 140px, 'hero' = 200px

export type LogoSize   = 'sm' | 'md' | 'lg' | 'xl' | 'hero'
export type LogoLayout = 'mark'       // just the V symbol
                       | 'horizontal' // V + VICMARG text side-by-side
                       | 'vertical'   // V above VICMARG text
                       | 'full'       // V + VICMARG + sub-label

const SIZE_H: Record<LogoSize, number> = {
  sm:   28,
  md:   44,
  lg:   80,
  xl:  140,
  hero: 200,
}

interface VicmargLogoProps {
  size?:      LogoSize
  layout?:    LogoLayout
  className?: string
  opacity?:   number
  subLabel?:  string  // 'Grupo Empresarial' by default
  glowColor?: string  // CSS color override for the primary glow
  useImage?:  boolean // when true, tries to use /images/logo.png
}

export function VicmargLogo({
  size      = 'md',
  layout    = 'horizontal',
  className = '',
  opacity   = 1,
  subLabel  = 'Grupo Empresarial',
  glowColor = '#60a5fa',
}: VicmargLogoProps) {
  const h = SIZE_H[size]

  if (layout === 'mark') {
    return <VicmargMark height={h} className={className} opacity={opacity} glowColor={glowColor} />
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`} style={{ opacity }}>
        <VicmargMark height={h} glowColor={glowColor} />
        <VicmargWordmark size={size} />
      </div>
    )
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-1.5 ${className}`} style={{ opacity }}>
        <VicmargMark height={h} glowColor={glowColor} />
        <VicmargWordmark size={size} centered />
      </div>
    )
  }

  // 'full'
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ opacity }}>
      <VicmargMark height={h} glowColor={glowColor} />
      <VicmargWordmark size={size} centered />
      {subLabel && (
        <span
          style={{
            fontSize:      Math.max(7, h * 0.065) + 'px',
            letterSpacing: '0.18em',
            color:         'rgba(148,163,184,0.60)',
            fontFamily:    'var(--font-mono)',
            fontWeight:    400,
            textTransform: 'uppercase',
          }}
        >
          {subLabel}
        </span>
      )}
    </div>
  )
}

// ─── Mark (the V with orbital ring + signal arcs) ─────────────────────────────

function VicmargMark({
  height,
  className = '',
  opacity   = 1,
  glowColor = '#60a5fa',
}: {
  height:     number
  className?: string
  opacity?:   number
  glowColor?: string
}) {
  const w = height * 1.1  // viewBox is 110×100
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 110 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      aria-label="VICMARG logo mark"
    >
      <defs>
        {/* Chrome/silver V gradient */}
        <linearGradient id="vm-v-outer" x1="25" y1="8" x2="85" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#93c5fd" />
          <stop offset="30%"  stopColor="#dbeafe" />
          <stop offset="65%"  stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="vm-v-inner" x1="36" y1="12" x2="74" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
        {/* Orbital ring gradient — fade at ends */}
        <linearGradient id="vm-ring1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={glowColor} stopOpacity="0"   />
          <stop offset="25%"  stopColor={glowColor} stopOpacity="0.8" />
          <stop offset="60%"  stopColor="#bfdbfe"   stopOpacity="1"   />
          <stop offset="85%"  stopColor={glowColor} stopOpacity="0.7" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0"   />
        </linearGradient>
        <linearGradient id="vm-ring2" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor={glowColor} stopOpacity="0"   />
          <stop offset="20%"  stopColor={glowColor} stopOpacity="0.5" />
          <stop offset="50%"  stopColor="#93c5fd"   stopOpacity="0.7" />
          <stop offset="80%"  stopColor={glowColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0"   />
        </linearGradient>
        {/* Glow filter */}
        <filter id="vm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="vm-glow-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Orbital ring — behind the V ──────────────────────────────────── */}
      {/* back half of ring (behind V) */}
      <ellipse
        cx="55" cy="48" rx="50" ry="16"
        stroke="url(#vm-ring2)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.55"
        filter="url(#vm-glow)"
      />
      {/* Glow under the ring */}
      <ellipse
        cx="55" cy="48" rx="50" ry="16"
        stroke={glowColor}
        strokeWidth="3"
        fill="none"
        opacity="0.12"
        filter="url(#vm-glow-soft)"
      />

      {/* ── V Shape ─────────────────────────────────────────────────────── */}
      {/* Outer stroke (chrome edge) */}
      <path
        d="M18 10 L55 76 L92 10"
        stroke="url(#vm-v-outer)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#vm-glow)"
      />
      {/* Inner highlight (chrome sheen) */}
      <path
        d="M25 10 L55 65 L85 10"
        stroke="url(#vm-v-inner)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center bright line */}
      <path
        d="M38 10 L55 52 L72 10"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* ── Sparkle points on ring ────────────────────────────────────── */}
      <circle cx="18"  cy="48" r="1.8" fill="white" opacity="0.9" filter="url(#vm-glow)" />
      <circle cx="92"  cy="44" r="2.2" fill="#bfdbfe" opacity="0.9" filter="url(#vm-glow)" />
      <circle cx="55"  cy="64" r="1.4" fill={glowColor} opacity="0.8" />

      {/* ── Front half of ring (in front of V) ────────────────────────── */}
      <path
        d="M 5 48 Q 30 62 55 64 Q 80 66 105 50"
        stroke="url(#vm-ring1)"
        strokeWidth="1.8"
        fill="none"
        filter="url(#vm-glow)"
      />

      {/* ── Signal / WiFi arcs (top-right) ──────────────────────────── */}
      <path
        d="M88 16 Q95 9 88 2"
        stroke={glowColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
        filter="url(#vm-glow)"
      />
      <path
        d="M93 19 Q104 8 93 -3"
        stroke={glowColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        filter="url(#vm-glow)"
      />
      <path
        d="M98 22 Q113 6 98 -10"
        stroke="#93c5fd"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
    </svg>
  )
}

// ─── Wordmark (VICMARG text) ──────────────────────────────────────────────────

function VicmargWordmark({
  size,
  centered = false,
}: {
  size:     LogoSize
  centered?: boolean
}) {
  const h     = SIZE_H[size]
  const fSize = Math.max(9, h * 0.32)
  const ls    = Math.max(2, h * 0.07) + 'px'

  return (
    <div style={{ textAlign: centered ? 'center' : 'left' }}>
      <span
        style={{
          fontFamily:    'var(--font-cinematic)',
          fontSize:      fSize + 'px',
          fontWeight:    300,
          letterSpacing: ls,
          color:         'rgba(255,255,255,0.92)',
          lineHeight:    1,
          display:       'block',
        }}
      >
        VICMARG
      </span>
    </div>
  )
}
