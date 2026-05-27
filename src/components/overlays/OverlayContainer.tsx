'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useOverlayStore, selectActiveOverlays } from '@store/overlay.store'
import { Materials } from '@config/design-tokens'
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

const MOTION_VARIANTS = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -12 },
} as const

// ─── Position helpers ─────────────────────────────────────────────────────────
// Returns a plain CSS object applied to a non-motion wrapper div, avoiding the
// MotionStyle vs CSSProperties type incompatibility with exactOptionalPropertyTypes.

interface PositionStyle {
  position: 'absolute'
  top?: string
  bottom?: string
  left?: string
  right?: string
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

// ─── Placeholder overlay card (Phase 3) ──────────────────────────────────────
// Phase 4 replaces this with real overlay components (ReceptionistCapture, etc.)

function OverlayCard({ overlay, onDismiss }: {
  overlay:   OverlayInstance
  onDismiss: () => void
}) {
  return (
    <div
      className="relative rounded-xl p-6 min-w-[280px] max-w-sm text-white"
      style={GLASS_STYLES[overlay.glassMaterial]}
    >
      {overlay.dismissible && (
        <button
          className="absolute top-3 right-4 text-white/40 hover:text-white/80 transition-colors text-xl leading-none"
          onClick={onDismiss}
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>
      )}
      <p className="text-[10px] uppercase tracking-[0.16em] text-white/30 mb-1 font-mono">
        {overlay.sceneId}
      </p>
      <p className="text-sm font-light text-white/60 font-mono">{overlay.id}</p>
    </div>
  )
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
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <OverlayCard
              overlay={overlay}
              onDismiss={() => { closeOverlay(overlay.id) }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
