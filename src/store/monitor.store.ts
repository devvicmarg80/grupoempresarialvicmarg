// Runtime monitor store — populated by RuntimeMonitor via EventBus subscriptions.
// Dev-only in practice; collected in production but panel not rendered.
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { SceneId } from '@types-app'

export interface TransitionRecord {
  from:       SceneId
  to:         SceneId
  timestamp:  number
  durationMs: number | null // null until scene:transition:complete fires
}

export interface FPSDropRecord {
  fps:       number
  threshold: number
  timestamp: number
}

interface MonitorState {
  timelineCount:       number
  scrollTriggerCount:  number
  recentTransitions:   TransitionRecord[]
  videoStates:         Record<string, string>
  activeOverlayIds:    string[]
  recentFPSDrops:      FPSDropRecord[]
}

interface MonitorActions {
  incrementTimelines:      () => void
  decrementTimelines:      () => void
  setScrollTriggerCount:   (n: number) => void
  logTransitionStart:      (from: SceneId, to: SceneId) => void
  logTransitionComplete:   (to: SceneId, durationMs: number) => void
  setVideoState:           (sceneId: string, state: string) => void
  setOverlayActive:        (overlayId: string, active: boolean) => void
  logFPSDrop:              (drop: FPSDropRecord) => void
}

type MonitorStore = MonitorState & MonitorActions

export const useMonitorStore = create<MonitorStore>()(
  subscribeWithSelector((set, get) => ({
    timelineCount:      0,
    scrollTriggerCount: 0,
    recentTransitions:  [],
    videoStates:        {},
    activeOverlayIds:   [],
    recentFPSDrops:     [],

    incrementTimelines: () =>
      set((s) => ({ timelineCount: s.timelineCount + 1 })),

    decrementTimelines: () =>
      set((s) => ({ timelineCount: Math.max(0, s.timelineCount - 1) })),

    setScrollTriggerCount: (n) =>
      set({ scrollTriggerCount: n }),

    logTransitionStart: (from, to) =>
      set((s) => ({
        recentTransitions: [
          ...s.recentTransitions.slice(-4),
          { from, to, timestamp: Date.now(), durationMs: null },
        ],
      })),

    logTransitionComplete: (to, durationMs) => {
      const transitions = get().recentTransitions
      const lastIdx = transitions.length - 1
      set({
        recentTransitions: transitions.map((t, i) =>
          i === lastIdx && t.to === to ? { ...t, durationMs } : t
        ),
      })
    },

    setVideoState: (sceneId, state) =>
      set((s) => ({ videoStates: { ...s.videoStates, [sceneId]: state } })),

    setOverlayActive: (overlayId, active) =>
      set((s) => ({
        activeOverlayIds: active
          ? [...s.activeOverlayIds.filter((id) => id !== overlayId), overlayId]
          : s.activeOverlayIds.filter((id) => id !== overlayId),
      })),

    logFPSDrop: (drop) =>
      set((s) => ({ recentFPSDrops: [...s.recentFPSDrops.slice(-4), drop] })),
  }))
)

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectTimelineCount      = (s: MonitorStore) => s.timelineCount
export const selectScrollTriggerCount = (s: MonitorStore) => s.scrollTriggerCount
export const selectRecentTransitions  = (s: MonitorStore) => s.recentTransitions
export const selectVideoStates        = (s: MonitorStore) => s.videoStates
export const selectActiveOverlayIds   = (s: MonitorStore) => s.activeOverlayIds
export const selectRecentFPSDrops     = (s: MonitorStore) => s.recentFPSDrops
