// VicmargLogo — brand mark component backed by the official PNG logo.
// Uses Next.js <Image> for optimized delivery.
// Size variants: 'sm' = 28px, 'md' = 44px, 'lg' = 80px, 'xl' = 140px, 'hero' = 200px
// Layout variants: 'mark' (logo only), 'horizontal' (logo + VICMARG side by side),
//                  'vertical' (logo above VICMARG), 'full' (logo + VICMARG + sub-label)

import Image from 'next/image'

export type LogoSize   = 'sm' | 'md' | 'lg' | 'xl' | 'hero'
export type LogoLayout = 'mark' | 'horizontal' | 'vertical' | 'full'

// Logo image is 1200×800, aspect ratio 3:2
const SIZE_H: Record<LogoSize, number> = { sm: 28, md: 44, lg: 80, xl: 140, hero: 200 }

interface VicmargLogoProps {
  size?:      LogoSize
  layout?:    LogoLayout
  className?: string
  opacity?:   number
  subLabel?:  string
  glowColor?: string  // unused — kept for API compatibility
}

export function VicmargLogo({
  size      = 'md',
  layout    = 'horizontal',
  className = '',
  opacity   = 1,
  subLabel  = 'Grupo Empresarial',
}: VicmargLogoProps) {
  const h = SIZE_H[size]
  const w = Math.round(h * 1.5)   // 3:2 aspect ratio

  const mark = (
    <div
      className="shrink-0 relative"
      style={{ width: w, height: h, opacity, mixBlendMode: 'screen' }}
    >
      <Image
        src="/images/logo.png"
        alt="VICMARG"
        width={w}
        height={h}
        style={{ objectFit: 'contain' }}
        priority={size === 'lg' || size === 'xl' || size === 'hero'}
      />
    </div>
  )

  if (layout === 'mark') {
    return <div className={className}>{mark}</div>
  }

  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center gap-0 ${className}`} style={{ opacity }}>
        {mark}
      </div>
    )
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center ${className}`} style={{ opacity }}>
        {mark}
      </div>
    )
  }

  // 'full' — logo + sub-label below
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ opacity }}>
      {mark}
      {subLabel && (
        <span
          style={{
            fontSize:      Math.max(7, h * 0.065) + 'px',
            letterSpacing: '0.18em',
            color:         'rgba(148,163,184,0.55)',
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
