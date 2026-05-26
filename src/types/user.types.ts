// ─── VICMARG User Types ──────────────────────────────────────────────────────
// User journey tracking: name capture, scene progress, Supabase session.
// ───────────────────────────────────────────────────────────────────────────

import type { SceneId } from './scene.types'

/** Minimal Supabase session shape (full type comes from @supabase/supabase-js) */
export interface VicmargSession {
  readonly userId: string
  readonly email: string | undefined
  readonly accessToken: string
  readonly expiresAt: number | undefined
}

/** User journey through the 4 cinematic scenes */
export interface UserJourney {
  readonly sceneReachedAt: Partial<Record<SceneId, number>> // timestamp
  readonly scenesCompleted: SceneId[]
  readonly totalTimeMs: number
  readonly convertedAt: number | null
}

/** Zustand user store shape */
export interface UserState {
  visitorName: string | null     // Captured in Scene 02 GREETING
  journeyProgress: number        // 0–4: scenes completed
  currentSceneIndex: number      // 0-based index
  hasInteracted: boolean         // First user interaction (unlocks iOS autoplay)
  capturedAt: number | null      // Timestamp of name capture
  session: VicmargSession | null // Supabase session
  journey: UserJourney
}

/** Zustand user store actions */
export interface UserActions {
  setVisitorName: (name: string) => void
  setInteracted: (interacted: boolean) => void
  setSession: (session: VicmargSession | null) => void
  advanceJourney: (scene: SceneId) => void
  recordSceneReached: (scene: SceneId) => void
  setConverted: () => void
  reset: () => void
}
