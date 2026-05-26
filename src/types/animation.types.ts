// ─── VICMARG Animation Types ────────────────────────────────────────────────
// GSAP orchestration contracts: decoupled from state, pure DOM commands.
// Rule: GSAP only via AnimationOrchestrator + EventBus. Never in components.
// ───────────────────────────────────────────────────────────────────────────

import type { SceneId } from './scene.types'

/** Named easing keys from EasingLibrary.ts */
export type EasingKey =
  | 'entry'      // power2.out — overlay entrances
  | 'exit'       // power2.in  — overlay exits
  | 'cinematic'  // power4.inOut — scene transitions
  | 'organic'    // elastic.out(1,0.5) — hover microinteractions
  | 'scroll'     // none (scrub:1) — scroll-linked animations
  | 'text'       // power1.out — text reveal
  | 'premium'    // Custom bezier — CTA animations

/** Command object returned by TimelineFactory */
export interface AnimationCommand {
  readonly play:    () => void
  readonly pause:   () => void
  readonly reverse: () => void
  readonly seek:    (progress: number) => void
  readonly kill:    () => void
  readonly progress: () => number
  readonly id:      string
}

/** Factory config for creating a named timeline */
export interface TimelineConfig {
  readonly id: string
  readonly sceneId: SceneId
  readonly autoPlay: boolean
  readonly ease: EasingKey
  readonly duration: number
  readonly delay?: number
  readonly repeat?: number
  readonly yoyo?: boolean
}

/** EventBus payload for animation lifecycle events */
export interface AnimationEventPayload {
  readonly timelineId: string
  readonly sceneId: SceneId
  readonly progress?: number
}

/** GSAP effect registration shape */
export interface GSAPEffect {
  readonly name: string
  readonly defaults: Record<string, unknown>
  readonly extendTimeline?: boolean
}

/** Scroll trigger configuration */
export interface ScrollTriggerConfig {
  readonly id: string
  readonly sceneId: SceneId
  readonly trigger: string | Element
  readonly start: string
  readonly end: string
  readonly scrub: boolean | number
  readonly pin?: boolean
  readonly markers?: boolean  // dev only
}
