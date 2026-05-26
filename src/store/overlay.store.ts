// ─── Overlay Store ────────────────────────────────────────────────────────────
// OverlaySystem state. Max simultaneous overlays driven by device tier.
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  OverlaySystemState, OverlayActions,
  OverlayConfig, OverlayInstance, OverlayVisibilityState,
} from '@types-app'

const INITIAL_STATE: OverlaySystemState = {
  activeOverlays:  [],
  queuedOverlays:  [],
  maxSimultaneous: 3, // Updated by PerformanceProvider on tier detection
}

type OverlayStore = OverlaySystemState & OverlayActions

export const useOverlayStore = create<OverlayStore>()(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    openOverlay: (config: OverlayConfig) => {
      const { activeOverlays, queuedOverlays, maxSimultaneous } = get()

      // Check if already active
      if (activeOverlays.some((o) => o.id === config.id)) return

      // Create instance
      const instance: OverlayInstance = {
        ...config,
        visibilityState: 'mounting',
        mountedAt:       Date.now(),
        element:         null,
      }

      if (activeOverlays.length < maxSimultaneous) {
        // Activate immediately
        set({ activeOverlays: [...activeOverlays, instance] })
      } else {
        // Queue — will activate when an active overlay dismisses
        set({
          queuedOverlays: [...queuedOverlays, config]
            .sort((a, b) => b.priority - a.priority), // Sort by priority
        })
      }
    },

    closeOverlay: (id: string) => {
      const { activeOverlays, queuedOverlays, maxSimultaneous } = get()

      const filtered = activeOverlays.filter((o) => o.id !== id)

      // Promote from queue if space available and queue not empty
      const nextFromQueue = queuedOverlays[0]
      const newActive = nextFromQueue && filtered.length < maxSimultaneous
        ? [
            ...filtered,
            {
              ...nextFromQueue,
              visibilityState: 'mounting' as OverlayVisibilityState,
              mountedAt:       Date.now(),
              element:         null,
            },
          ]
        : filtered

      const newQueue = nextFromQueue && newActive.length > filtered.length
        ? queuedOverlays.slice(1)
        : queuedOverlays

      set({ activeOverlays: newActive, queuedOverlays: newQueue })
    },

    dismissAll: () =>
      set({ activeOverlays: [], queuedOverlays: [] }),

    setOverlayState: (id: string, visibilityState: OverlayVisibilityState) =>
      set((state) => ({
        activeOverlays: state.activeOverlays.map((o) =>
          o.id === id ? { ...o, visibilityState } : o
        ),
      })),

    setMaxSimultaneous: (max: number) =>
      set({ maxSimultaneous: max }),

    setElement: (id: string, el: HTMLElement) =>
      set((state) => ({
        activeOverlays: state.activeOverlays.map((o) =>
          o.id === id ? { ...o, element: el } : o
        ),
      })),
  }))
)

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectActiveOverlays  = (s: OverlayStore) => s.activeOverlays
export const selectQueuedOverlays  = (s: OverlayStore) => s.queuedOverlays
export const selectMaxOverlays     = (s: OverlayStore) => s.maxSimultaneous
export const selectOverlayById     = (id: string) => (s: OverlayStore) =>
  s.activeOverlays.find((o) => o.id === id) ?? null
