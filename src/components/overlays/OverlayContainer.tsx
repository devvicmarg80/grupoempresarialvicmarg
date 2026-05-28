'use client'

import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { useOverlayStore, selectActiveOverlays } from '@store/overlay.store'
import { Materials }                from '@config/design-tokens'
import { ReceptionistCapture }      from './ReceptionistCapture'
import { ServicesHologram }         from './ServicesHologram'
import { EcosystemExplorer }        from './EcosystemExplorer'
import { PremiumCTA }               from './PremiumCTA'
import type { GlassMaterialVariant, OverlayInstance } from '@types-app'

// ─── Glass styles keyed by material variant ───────────────────────────────────

const GLASS_STYLES: Record<GlassMaterialVariant, React.CSSProperties> = {
  dark: {
    background:          Materials.glass.dark.background,
    border:              `1px solid ${Materials.glass.dark.border}`,
    backdropFilter:      `blur(${Materials.glass.dark.blur})`,
    WebkitBackdropFilter:`blur(${Materials.glass.dark.blur})`,
  },
  cobalt: {
    background:          Materials.glass.cobalt.background,
    border:              `1px solid ${Materials.glass.cobalt.border}`,
    backdropFilter:      `blur(${Materials.glass.cobalt.blur})`,
    WebkitBackdropFilter:`blur(${Materials.glass.cobalt.blur})`,
  },
  warm: {
    background:          Materials.glass.warm.background,
    border:              `1px solid ${Materials.glass.warm.border}`,
    backdropFilter:      `blur(${Materials.glass.warm.blur})`,
    WebkitBackdropFilter:`blur(${Materials.glass.warm.blur})`,
  },
  minimal: {
    background:          Materials.glass.minimal.background,
    border:              `1px solid ${Materials.glass.minimal.border}`,
    backdropFilter:      `blur(${Materials.glass.minimal.blur})`,
    WebkitBackdropFilter:`blur(${Materials.glass.minimal.blur})`,
  },
}

// ─── Framer Motion variants ───────────────────────────────────────────────────
// Entry: expo.out spring feel — overlay emerges with authority.
// Exit: fast ease-in — clean, decisive, no linger.

const MOTION_VARIANTS: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -10, scale: 0.99,
    transition: { duration: 0.20, ease: [0.4, 0, 1, 1] },
  },
}

// ─── Position helpers ─────────────────────────────────────────────────────────
// PositionStyle uses only the CSS props we write — avoids CSSProperties' x?: T|undefined
// incompatibility with Framer Motion's MotionStyle under exactOptionalPropertyTypes.

interface PositionStyle {
  position: 'absolute'
  top?:     string
  bottom?:  string
  left?:    string
  right?:   string
  transform?: string
}

function getPositionStyle(overlay: OverlayInstance): PositionStyle {
  const { vertical, horizontal, offsetX, offsetY } = overlay.position
  const pos: PositionStyle = { position: 'absolute' }

  if (vertical === 'top')    pos.top    = offsetY !== undefined ? `calc(2rem + ${offsetY}px)` : '2rem'
  if (vertical === 'bottom') pos.bottom = offsetY !== undefined ? `calc(2rem + ${offsetY}px)` : '2rem'
  if (vertical === 'center') { pos.top = '50%'; pos.transform = 'translateY(-50%)' }

  if (horizontal === 'left')   pos.left  = offsetX !== undefined ? `calc(2rem + ${offsetX}px)` : '2rem'
  if (horizontal === 'right')  pos.right = offsetX !== undefined ? `calc(2rem + ${offsetX}px)` : '2rem'
  if (horizontal === 'center') {
    pos.left = '50%'
    pos.transform = vertical === 'center'
      ? 'translate(-50%, -50%)'
      : `${pos.transform ?? ''} translateX(-50%)`.trim()
  }

  return pos
}

// ─── Fallback placeholder for unknown overlay IDs ─────────────────────────────

function OverlayFallback({ overlay, onDismiss }: { overlay: OverlayInstance; onDismiss: () => void }) {
  return (
    <div
      className="relative rounded-xl p-6 min-w-[280px] max-w-sm text-white"
      style={GLASS_STYLES[overlay.glassMaterial]}
    >
      {overlay.dismissible && (
        <button
          type="button"
          className="absolute top-3 right-4 text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
          onClick={onDismiss}
          aria-label="Cerrar"
        >
          ×
        </button>
      )}
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/30 mb-1 font-mono">{overlay.sceneId}</p>
      <p className="text-sm font-light text-white/60 font-mono">{overlay.id}</p>
    </div>
  )
}

// ─── Overlay router — maps overlay ID to real Phase 4 component ───────────────

function renderOverlayContent(overlay: OverlayInstance, onDismiss: () => void): React.ReactNode {
  switch (overlay.id) {
    case 'receptionist-name-capture': return <ReceptionistCapture overlay={overlay} onDismiss={onDismiss} />
    case 'services-hologram-menu':    return <ServicesHologram    overlay={overlay} onDismiss={onDismiss} />
    case 'ecosystem-explorer':        return <EcosystemExplorer   overlay={overlay} onDismiss={onDismiss} />
    case 'premium-cta':               return <PremiumCTA          overlay={overlay} onDismiss={onDismiss} />
    default:                          return <OverlayFallback     overlay={overlay} onDismiss={onDismiss} />
  }
}

// ─── Container ───────────────────────────────────────────────────────────────

export function OverlayContainer() {
  const activeOverlays = useOverlayStore(selectActiveOverlays)
  const closeOverlay   = useOverlayStore((s) => s.closeOverlay)

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 40 }}
      aria-live="polite"
    >
      <AnimatePresence>
        {activeOverlays.map((overlay) => (
          <motion.div
            key={overlay.id}
            className="pointer-events-auto"
            style={getPositionStyle(overlay)}
            variants={MOTION_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderOverlayContent(overlay, () => { closeOverlay(overlay.id) })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
