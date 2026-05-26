// ─── VICMARG Performance Configuration ───────────────────────────────────────
// Device tier thresholds and quality budgets.
// DeviceCapabilityDetector uses this to classify every device at startup.
// ───────────────────────────────────────────────────────────────────────────

import type { TierQualityBudget, FPSThresholds, DeviceTier, VideoMemoryBudget } from '@types-app'

// ─── FPS Monitor Thresholds ───────────────────────────────────────────────
export const FPS_THRESHOLDS: FPSThresholds = {
  target:        60,   // Ideal — GPU-accelerated smooth
  acceptable:    50,   // Good enough — no action
  degradation:   40,   // Trigger tier reduce
  critical:      25,   // Emergency mode — kill Three.js + overlays
  sampleWindow:  2000, // ms — rolling average window
} as const

// ─── Video Memory Budget ──────────────────────────────────────────────────
export const VIDEO_MEMORY_BUDGET: VideoMemoryBudget = {
  maxActiveVideos:          2,    // Current + preloading-next only
  maxBufferBytes:           400 * 1024 * 1024,  // 400MB
  preloadTriggerProgress:   0.60, // Preload next at 60% of current video
  preloadAbortFPSThreshold: 50,   // Pause preload if FPS drops below 50
} as const

// ─── Per-Tier Quality Budgets ──────────────────────────────────────────────
export const TIER_BUDGETS: Record<DeviceTier, TierQualityBudget> = {
  HIGH: {
    videoQuality:            '1080p',
    maxSimultaneousOverlays: 3,
    glassLevel:              3,   // Full glassmorphism
    threeJSEnabled:          true,
    particleCount:           300,
    gsapComplexity:          'full',
  },
  MID: {
    videoQuality:            '720p',
    maxSimultaneousOverlays: 1,
    glassLevel:              1,   // Reduced blur
    threeJSEnabled:          false,
    particleCount:           50,
    gsapComplexity:          'core',
  },
  LOW: {
    videoQuality:            '480p',
    maxSimultaneousOverlays: 0,   // No glassmorphism overlays
    glassLevel:              0,
    threeJSEnabled:          false,
    particleCount:           0,
    gsapComplexity:          'minimal',
  },
} as const

// ─── Device Detection Thresholds ────────────────────────────────────────────
// Used by DeviceCapabilityDetector to classify the device tier
export const DETECTION_THRESHOLDS = {
  HIGH: {
    minRAM:        4,     // GB
    minCPUCores:   4,
    minGPUTier:    2,     // HIGH dedicated GPU
    minDownlink:   10,    // Mbps
  },
  MID: {
    minRAM:        2,
    minCPUCores:   2,
    minGPUTier:    1,     // Integrated GPU
    minDownlink:   3,
  },
  // Below MID = LOW
} as const

// ─── HLS Config per Tier ───────────────────────────────────────────────────
export const HLS_CONFIGS = {
  HIGH: {
    maxBufferLength:           30,  // seconds
    maxBufferSize:             60 * 1024 * 1024, // 60MB
    startLevel:               -1,  // Auto ABR
    abrEnabled:                true,
    fragLoadingMaxRetry:       3,
    manifestLoadingMaxRetry:   2,
  },
  MID: {
    maxBufferLength:           20,
    maxBufferSize:             40 * 1024 * 1024,
    startLevel:               -1,
    abrEnabled:                true,
    fragLoadingMaxRetry:       2,
    manifestLoadingMaxRetry:   2,
  },
  LOW: {
    maxBufferLength:           10,
    maxBufferSize:             20 * 1024 * 1024,
    startLevel:                1,  // Force 480p
    abrEnabled:                false,
    fragLoadingMaxRetry:       1,
    manifestLoadingMaxRetry:   1,
  },
} as const
