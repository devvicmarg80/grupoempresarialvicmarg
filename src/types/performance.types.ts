// ─── VICMARG Performance Types ──────────────────────────────────────────────
// Device capability detection and adaptive quality contracts.
// DeviceCapabilityDetector runs BEFORE any other system mounts.
// ───────────────────────────────────────────────────────────────────────────

/** Adaptive quality tier — drives the entire experience fidelity */
export type DeviceTier = 'HIGH' | 'MID' | 'LOW'

/** Network connection type (from Network Information API) */
export type ConnectionType =
  | '4g' | '3g' | '2g' | 'slow-2g'
  | 'wifi'        // Inferred from speed
  | 'unknown'
  | 'offline'

/** Glassmorphism intensity level — 0 = disabled, 3 = full */
export type GlassLevel = 0 | 1 | 2 | 3

/** Raw device capability snapshot — detected once at startup */
export interface DeviceCapabilities {
  readonly tier: DeviceTier
  readonly gpuTier: 0 | 1 | 2 | 3    // 0=no GPU, 3=discrete GPU
  readonly ramGB: number | null        // null if API unavailable
  readonly cpuCores: number
  readonly connectionType: ConnectionType
  readonly downlinkMbps: number | null // null if API unavailable
  readonly supportsHLS: boolean
  readonly supportsWebGL: boolean
  readonly supportsWebGL2: boolean
  readonly supportsWebRTC: boolean     // For future OpenAI Realtime
  readonly supportsAudioContext: boolean
  readonly prefersReducedMotion: boolean
  readonly devicePixelRatio: number
  readonly isIOS: boolean
  readonly isSafari: boolean
  readonly isMobile: boolean
  readonly isTouch: boolean
  readonly screenWidth: number
  readonly screenHeight: number
}

/** Zustand performance store shape */
export interface PerformanceState {
  deviceTier: DeviceTier
  capabilities: DeviceCapabilities | null  // null until detection completes
  currentFPS: number
  averageFPS: number
  glassLevel: GlassLevel
  threeJSEnabled: boolean
  particlesEnabled: boolean
  reducedMotion: boolean
  connectionType: ConnectionType
  memoryPressure: boolean
  isDetected: boolean  // false = detection pending
}

/** Zustand performance store actions */
export interface PerformanceActions {
  setCapabilities: (caps: DeviceCapabilities) => void
  setTier: (tier: DeviceTier) => void
  setCurrentFPS: (fps: number) => void
  setAverageFPS: (fps: number) => void
  setGlassLevel: (level: GlassLevel) => void
  setThreeJSEnabled: (enabled: boolean) => void
  setMemoryPressure: (pressure: boolean) => void
  setConnectionType: (type: ConnectionType) => void
  reduceTier: () => void  // Emergency demotion
  setDetected: (detected: boolean) => void
}

/** Per-tier quality budget */
export interface TierQualityBudget {
  readonly videoQuality: import('./video.types').VideoQuality
  readonly maxSimultaneousOverlays: number
  readonly glassLevel: GlassLevel
  readonly threeJSEnabled: boolean
  readonly particleCount: number
  readonly gsapComplexity: 'full' | 'core' | 'minimal'
}

/** FPS Monitor thresholds */
export interface FPSThresholds {
  readonly target: number       // 60
  readonly acceptable: number   // 50
  readonly degradation: number  // 40 — triggers tier reduce
  readonly critical: number     // 25 — triggers emergency mode
  readonly sampleWindow: number // 2000ms measurement window
}
