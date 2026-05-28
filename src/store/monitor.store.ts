// Runtime monitor store — populated by RuntimeMonitor + GPUMonitor + HologramEngine.
// Dev-only panel reads from here. Metrics collected in all builds, panel renders only in dev.
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { SceneId } from '@types-app'

// ─── Exported metric types (used by GPUMonitor, HologramEngine, DevRuntimePanel) ──

export interface GPUInfo {
  vendor:             string
  renderer:           string
  webgl2:             boolean
  maxTextureSize:     number
  textureUnits:       number
  estimatedVRAMTier:  'HIGH' | 'MID' | 'LOW'
}

export interface HologramMetrics {
  frameTimeMs: number
  geometries:  number
  textures:    number
  programs:    number
}

export interface TransitionRecord {
  from:       SceneId
  to:         SceneId
  timestamp:  number
  durationMs: number | null
}

export interface FPSDropRecord {
  fps:       number
  threshold: number
  timestamp: number
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface MonitorState {
  // GSAP / ScrollTrigger
  timelineCount:            number
  scrollTriggerCount:       number
  // Scene lifecycle
  recentTransitions:        TransitionRecord[]
  // Video
  videoStates:              Record<string, string>
  // Overlays
  activeOverlayIds:         string[]
  // Performance
  recentFPSDrops:           FPSDropRecord[]
  droppedFrames:            number
  memoryUsageMB:            number | null
  lastTransitionLatencyMs:  number | null
  transitionStartedAt:      number | null
  // GPU (populated by GPUMonitor at startup)
  gpuInfo:                  GPUInfo | null
  // Three.js hologram (populated by HologramEngine while mounted)
  hologramMetrics:          HologramMetrics | null
}

interface MonitorActions {
  incrementTimelines:          () => void
  decrementTimelines:          () => void
  setScrollTriggerCount:       (n: number) => void
  logTransitionStart:          (from: SceneId, to: SceneId) => void
  logTransitionComplete:       (to: SceneId, durationMs: number) => void
  setVideoState:               (sceneId: string, state: string) => void
  setOverlayActive:            (overlayId: string, active: boolean) => void
  logFPSDrop:                  (drop: FPSDropRecord) => void
  setGPUInfo:                  (info: GPUInfo) => void
  setHologramMetrics:          (metrics: HologramMetrics | null) => void
  incrementDroppedFrames:      () => void
  setMemoryUsage:              (mb: number | null) => void
  setLastTransitionLatency:    (ms: number) => void
}

type MonitorStore = MonitorState & MonitorActions

export const useMonitorStore = create<MonitorStore>()(
  subscribeWithSelector((set, get) => ({
    timelineCount:           0,
    scrollTriggerCount:      0,
    recentTransitions:       [],
    videoStates:             {},
    activeOverlayIds:        [],
    recentFPSDrops:          [],
    droppedFrames:           0,
    memoryUsageMB:           null,
    lastTransitionLatencyMs: null,
    transitionStartedAt:     null,
    gpuInfo:                 null,
    hologramMetrics:         null,

    incrementTimelines: () =>
      set((s) => ({ timelineCount: s.timelineCount + 1 })),

    decrementTimelines: () =>
      set((s) => ({ timelineCount: Math.max(0, s.timelineCount - 1) })),

    setScrollTriggerCount: (n) =>
      set({ scrollTriggerCount: n }),

    logTransitionStart: (from, to) =>
      set((s) => ({
        transitionStartedAt: Date.now(),
        recentTransitions: [
          ...s.recentTransitions.slice(-4),
          { from, to, timestamp: Date.now(), durationMs: null },
        ],
      })),

    logTransitionComplete: (to, durationMs) => {
      const { recentTransitions, transitionStartedAt } = get()
      const lastIdx = recentTransitions.length - 1
      const actualLatencyMs = transitionStartedAt !== null
        ? Date.now() - transitionStartedAt
        : null
      set({
        transitionStartedAt:     null,
        lastTransitionLatencyMs: actualLatencyMs,
        recentTransitions: recentTransitions.map((t, i) =>
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

    setGPUInfo: (info) =>
      set({ gpuInfo: info }),

    setHologramMetrics: (metrics) =>
      set({ hologramMetrics: metrics }),

    incrementDroppedFrames: () =>
      set((s) => ({ droppedFrames: s.droppedFrames + 1 })),

    setMemoryUsage: (mb) =>
      set({ memoryUsageMB: mb }),

    setLastTransitionLatency: (ms) =>
      set({ lastTransitionLatencyMs: ms }),
  }))
)

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectTimelineCount           = (s: MonitorStore) => s.timelineCount
export const selectScrollTriggerCount      = (s: MonitorStore) => s.scrollTriggerCount
export const selectRecentTransitions       = (s: MonitorStore) => s.recentTransitions
export const selectVideoStates             = (s: MonitorStore) => s.videoStates
export const selectActiveOverlayIds        = (s: MonitorStore) => s.activeOverlayIds
export const selectRecentFPSDrops          = (s: MonitorStore) => s.recentFPSDrops
export const selectGPUInfo                 = (s: MonitorStore) => s.gpuInfo
export const selectHologramMetrics         = (s: MonitorStore) => s.hologramMetrics
export const selectDroppedFrames           = (s: MonitorStore) => s.droppedFrames
export const selectMemoryUsageMB           = (s: MonitorStore) => s.memoryUsageMB
export const selectLastTransitionLatencyMs = (s: MonitorStore) => s.lastTransitionLatencyMs
