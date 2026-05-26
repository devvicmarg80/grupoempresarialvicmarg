// ─── VICMARG Scene Types ────────────────────────────────────────────────────
// Source of truth for the cinematic narrative system.
// All 4 scenes, transitions, and state contracts are defined here.
// ───────────────────────────────────────────────────────────────────────────

/** The 4 cinematic scenes — ordered by narrative flow */
export type SceneId =
  | 'ARRIVAL'     // Scene 01: Impacto & Curiosidad (8-12s, dolly-forward)
  | 'GREETING'    // Scene 02: Confianza (IA Receptionist, overlay at second 4)
  | 'DISCOVERY'   // Scene 03: Asombro (Hologram corporate, Three.js)
  | 'CONVERSION'  // Scene 04: Aspiración (CTA Premium, open ending)

/** Ordered scene sequence for FSM navigation */
export const SCENE_ORDER: readonly SceneId[] = [
  'ARRIVAL',
  'GREETING',
  'DISCOVERY',
  'CONVERSION',
] as const

/** SceneManager transition state machine states */
export type SceneTransitionState =
  | 'idle'          // No transition in progress
  | 'transitioning' // Crossfade in progress — system locked
  | 'complete'      // Transition finished
  | 'error'         // Transition failed — fallback applied

/** Overlay trigger bound to scene progress (0–1) */
export interface OverlayTrigger {
  readonly overlayId: string
  readonly triggerAtProgress: number // 0.0–1.0
  readonly priority: number          // Higher = shown first when competing
  readonly dismissOnSceneChange: boolean
}

/** Full configuration for a cinematic scene */
export interface SceneConfig {
  readonly id: SceneId
  readonly label: string
  readonly emotionalIntent: string
  readonly durationMs: number
  readonly nextScene: SceneId | null
  readonly gsapTimelineKey: string  // Key in TimelineFactory registry
  readonly overlayTriggers: readonly OverlayTrigger[]
  readonly videoManifestKey: string // Key in VideoManifest registry
  readonly threeJSEnabled: boolean  // true only for DISCOVERY
}

/** Zustand scene store shape */
export interface SceneState {
  currentScene: SceneId
  previousScene: SceneId | null
  transitionState: SceneTransitionState
  sceneProgress: number       // 0.0–1.0 — driven by scroll/video, NOT React state
  isLocked: boolean           // true during transition — prevents double-transitions
  sceneHistory: SceneId[]
}

/** Zustand scene store actions */
export interface SceneActions {
  setScene: (scene: SceneId) => void
  setPreviousScene: (scene: SceneId | null) => void
  setTransitionState: (state: SceneTransitionState) => void
  setProgress: (progress: number) => void
  setLocked: (locked: boolean) => void
  pushHistory: (scene: SceneId) => void
  reset: () => void
}

/** Payload for a scene transition event */
export interface SceneTransitionPayload {
  from: SceneId
  to: SceneId
  timestamp: number
}

/** Result of an FSM transition attempt */
export type FSMTransitionResult =
  | { success: true; nextScene: SceneId }
  | { success: false; reason: string }
