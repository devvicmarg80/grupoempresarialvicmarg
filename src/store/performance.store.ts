// ─── Performance Store ────────────────────────────────────────────────────────
// Device tier, FPS, and adaptive quality state.
// CRITICAL: This store is initialized FIRST — before any other system.
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  PerformanceState, PerformanceActions,
  DeviceTier, GlassLevel, ConnectionType, DeviceCapabilities,
} from '@types-app'

const INITIAL_STATE: PerformanceState = {
  deviceTier:      'MID',   // Conservative default until detection
  capabilities:    null,
  currentFPS:      60,
  averageFPS:      60,
  glassLevel:      1,       // Reduced until detection confirms tier
  threeJSEnabled:  false,
  particlesEnabled:false,
  reducedMotion:   false,
  connectionType:  'unknown',
  memoryPressure:  false,
  isDetected:      false,
}

type PerformanceStore = PerformanceState & PerformanceActions

export const usePerformanceStore = create<PerformanceStore>()(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    setCapabilities: (capabilities: DeviceCapabilities) =>
      set({
        capabilities,
        deviceTier:       capabilities.tier,
        reducedMotion:    capabilities.prefersReducedMotion,
        connectionType:   capabilities.connectionType,
        // threeJSEnabled derived from tier, not set directly
        threeJSEnabled:   capabilities.tier === 'HIGH',
        particlesEnabled: capabilities.tier !== 'LOW',
        glassLevel:       tierToGlassLevel(capabilities.tier),
        isDetected:       true,
      }),

    setTier: (deviceTier: DeviceTier) =>
      set({
        deviceTier,
        threeJSEnabled:   deviceTier === 'HIGH',
        particlesEnabled: deviceTier !== 'LOW',
        glassLevel:       tierToGlassLevel(deviceTier),
      }),

    setCurrentFPS: (fps) => set({ currentFPS: fps }),

    setAverageFPS: (fps) => set({ averageFPS: fps }),

    setGlassLevel: (glassLevel: GlassLevel) => set({ glassLevel }),

    setThreeJSEnabled: (enabled) => set({ threeJSEnabled: enabled }),

    setMemoryPressure: (pressure) => set({ memoryPressure: pressure }),

    setConnectionType: (type: ConnectionType) => set({ connectionType: type }),

    // Emergency demotion — called when FPS drops critically
    reduceTier: () => {
      const { deviceTier } = get()
      const demoted: DeviceTier =
        deviceTier === 'HIGH' ? 'MID'
        : deviceTier === 'MID' ? 'LOW'
        : 'LOW' // Already at floor

      if (demoted !== deviceTier) {
        set({
          deviceTier:       demoted,
          threeJSEnabled:   false, // Always disable Three.js on demotion
          glassLevel:       tierToGlassLevel(demoted),
          particlesEnabled: demoted !== 'LOW',
        })
      }
    },

    setDetected: (isDetected) => set({ isDetected }),
  }))
)

// ─── Helpers ──────────────────────────────────────────────────────────────
function tierToGlassLevel(tier: DeviceTier): GlassLevel {
  return tier === 'HIGH' ? 3 : tier === 'MID' ? 1 : 0
}

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectDeviceTier      = (s: PerformanceStore) => s.deviceTier
export const selectCapabilities    = (s: PerformanceStore) => s.capabilities
export const selectCurrentFPS      = (s: PerformanceStore) => s.currentFPS
export const selectGlassLevel      = (s: PerformanceStore) => s.glassLevel
export const selectThreeJSEnabled  = (s: PerformanceStore) => s.threeJSEnabled
export const selectMemoryPressure  = (s: PerformanceStore) => s.memoryPressure
export const selectIsDetected      = (s: PerformanceStore) => s.isDetected
export const selectReducedMotion   = (s: PerformanceStore) => s.reducedMotion
