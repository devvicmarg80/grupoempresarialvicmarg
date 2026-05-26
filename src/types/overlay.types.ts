// ─── VICMARG Overlay Types ──────────────────────────────────────────────────
// OverlaySystem contracts: React Portal-based, glassmorphism, queued.
// Max 3 simultaneous overlays. Never incrustados en video layer.
// ───────────────────────────────────────────────────────────────────────────

/** Overlay visibility lifecycle states */
export type OverlayVisibilityState =
  | 'mounting'   // Component mounted, entering animation
  | 'visible'    // Fully visible and interactive
  | 'dismissing' // Exit animation in progress
  | 'hidden'     // Off-screen / unmounted

/** Priority determines render order when queue is full */
export type OverlayPriority = 1 | 2 | 3 | 4 | 5
// 1 = lowest (informational), 5 = highest (critical CTA)

/** Glassmorphism style variant */
export type GlassMaterialVariant =
  | 'dark'       // rgba(13,13,31,0.7) — standard VICMARG overlay
  | 'cobalt'     // Cobalt-tinted glass
  | 'warm'       // Warm executive glass
  | 'minimal'    // Ultra-minimal, barely visible

/** Configuration for registering an overlay */
export interface OverlayConfig {
  readonly id: string
  readonly priority: OverlayPriority
  readonly sceneId: string
  readonly dismissible: boolean          // Can user close it?
  readonly dismissOnSceneChange: boolean // Auto-close on scene transition
  readonly glassMaterial: GlassMaterialVariant
  readonly position: OverlayPosition
  readonly autoHideMs?: number           // undefined = manual dismiss only
  readonly backdropClose: boolean        // Clicking backdrop closes overlay
}

/** Overlay screen position */
export interface OverlayPosition {
  readonly vertical: 'top' | 'center' | 'bottom'
  readonly horizontal: 'left' | 'center' | 'right'
  readonly offsetX?: number  // px from edge
  readonly offsetY?: number
}

/** Live overlay instance managed by OverlayManager */
export interface OverlayInstance extends OverlayConfig {
  visibilityState: OverlayVisibilityState
  mountedAt: number
  element: HTMLElement | null // Set after portal mount
}

/** Zustand overlay store shape */
export interface OverlaySystemState {
  activeOverlays: OverlayInstance[]
  queuedOverlays: OverlayConfig[]
  maxSimultaneous: number  // Driven by DeviceTier (3/1/0)
}

/** Zustand overlay store actions */
export interface OverlayActions {
  openOverlay: (config: OverlayConfig) => void
  closeOverlay: (id: string) => void
  dismissAll: () => void
  setOverlayState: (id: string, state: OverlayVisibilityState) => void
  setMaxSimultaneous: (max: number) => void
  setElement: (id: string, el: HTMLElement) => void
}
