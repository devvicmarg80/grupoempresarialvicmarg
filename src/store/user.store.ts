// ─── User Store ────────────────────────────────────────────────────────────
// Visitor journey, name capture, funnel state, and session.
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { UserState, UserActions, VicmargSession, UserJourney, SceneId, ServiceType } from '@types-app'

const INITIAL_JOURNEY: UserJourney = {
  sceneReachedAt:  {},
  scenesCompleted: [],
  totalTimeMs:     0,
  convertedAt:     null,
}

const INITIAL_STATE: UserState = {
  visitorName:          null,
  journeyProgress:      0,
  currentSceneIndex:    0,
  hasInteracted:        false,
  capturedAt:           null,
  session:              null,
  journey:              INITIAL_JOURNEY,
  isAffiliated:         null,
  selectedService:      null,
  registrationSubmitted:false,
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    setVisitorName: (name: string) =>
      set({ visitorName: name.trim(), capturedAt: Date.now() }),

    setInteracted: (hasInteracted: boolean) => set({ hasInteracted }),

    setSession: (session: VicmargSession | null) => set({ session }),

    setAffiliation: (isAffiliated: boolean) => set({ isAffiliated }),

    setSelectedService: (service: ServiceType) => set({ selectedService: service }),

    setRegistrationSubmitted: () => set({ registrationSubmitted: true }),

    advanceJourney: (scene: SceneId) => {
      const { journey } = get()
      const scenesCompleted = journey.scenesCompleted.includes(scene)
        ? journey.scenesCompleted
        : [...journey.scenesCompleted, scene]

      set({
        journeyProgress: scenesCompleted.length,
        journey: {
          ...journey,
          scenesCompleted,
          totalTimeMs: Date.now() - (journey.sceneReachedAt['ARRIVAL'] ?? Date.now()),
        },
      })
    },

    recordSceneReached: (scene: SceneId) => {
      const { journey } = get()
      if (journey.sceneReachedAt[scene]) return

      set({
        journey: {
          ...journey,
          sceneReachedAt: { ...journey.sceneReachedAt, [scene]: Date.now() },
        },
      })
    },

    setConverted: () => {
      const { journey } = get()
      set({ journey: { ...journey, convertedAt: Date.now() } })
    },

    reset: () => set(INITIAL_STATE),
  }))
)

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectVisitorName        = (s: UserStore) => s.visitorName
export const selectHasInteracted      = (s: UserStore) => s.hasInteracted
export const selectSession            = (s: UserStore) => s.session
export const selectJourneyProgress    = (s: UserStore) => s.journeyProgress
export const selectUserJourney        = (s: UserStore) => s.journey
export const selectIsAuthenticated    = (s: UserStore) => s.session !== null
export const selectIsAffiliated       = (s: UserStore) => s.isAffiliated
export const selectSelectedService    = (s: UserStore) => s.selectedService
export const selectRegistrationDone   = (s: UserStore) => s.registrationSubmitted
