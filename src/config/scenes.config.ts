// ─── VICMARG Scenes Configuration ────────────────────────────────────────────
// Master registry of the 4 cinematic scenes.
// Source of truth for SceneRegistry.ts and VideoEngine manifests.
// All videos: Veo 3.1 · First-person · Anamorphic · 24fps · ACES Filmic
// ───────────────────────────────────────────────────────────────────────────

import type { SceneConfig, VideoManifest } from '@types-app'

// ─── Video Manifests ─────────────────────────────────────────────────────────
// URLs point to Cloudflare R2 via the /videos proxy rewrite in next.config.ts
export const VIDEO_MANIFESTS: Record<string, VideoManifest> = {
  arrival: {
    sceneId:         'arrival',
    masterPlaylistUrl: '/videos/scenes/arrival/master.m3u8',
    posterUrl:         '/videos/scenes/arrival/poster.avif',
    posterBlurUrl:     '/videos/scenes/arrival/poster-blur.webp',
    durationMs:        10_000,   // 8-12 seconds per storyboard
    aspectRatio:       '16:9',
    qualities:         ['1080p', '720p', '480p', '360p'],
  },
  greeting: {
    sceneId:         'greeting',
    masterPlaylistUrl: '/videos/scenes/greeting/master.m3u8',
    posterUrl:         '/videos/scenes/greeting/poster.avif',
    posterBlurUrl:     '/videos/scenes/greeting/poster-blur.webp',
    durationMs:        15_000,   // Receptionist interaction window
    aspectRatio:       '16:9',
    qualities:         ['1080p', '720p', '480p', '360p'],
  },
  discovery: {
    sceneId:         'discovery',
    masterPlaylistUrl: '/videos/scenes/discovery/master.m3u8',
    posterUrl:         '/videos/scenes/discovery/poster.avif',
    posterBlurUrl:     '/videos/scenes/discovery/poster-blur.webp',
    durationMs:        20_000,   // Hologram + services exploration
    aspectRatio:       '16:9',
    qualities:         ['1080p', '720p', '480p', '360p'],
  },
  conversion: {
    sceneId:         'conversion',
    masterPlaylistUrl: '/videos/scenes/conversion/master.m3u8',
    posterUrl:         '/videos/scenes/conversion/poster.avif',
    posterBlurUrl:     '/videos/scenes/conversion/poster-blur.webp',
    durationMs:        12_000,   // CTA + open ending
    aspectRatio:       '16:9',
    qualities:         ['1080p', '720p', '480p', '360p'],
  },
} as const

// ─── Scene Configurations ──────────────────────────────────────────────────
export const SCENES_CONFIG: Record<string, SceneConfig> = {
  ARRIVAL: {
    id:              'ARRIVAL',
    label:           'Arrival',
    emotionalIntent: 'Impacto y curiosidad — primer contacto con el universo VICMARG',
    durationMs:      10_000,
    nextScene:       'GREETING',
    gsapTimelineKey: 'arrival',
    videoManifestKey:'arrival',
    threeJSEnabled:  false,
    overlayTriggers: [
      // No overlays in Arrival — pure cinematic impact
    ],
  },

  GREETING: {
    id:              'GREETING',
    label:           'Greeting',
    emotionalIntent: 'Confianza y conexión — la recepcionista IA te recibe por nombre',
    durationMs:      15_000,
    nextScene:       'DISCOVERY',
    gsapTimelineKey: 'greeting',
    videoManifestKey:'greeting',
    threeJSEnabled:  false,
    overlayTriggers: [
      {
        overlayId:            'receptionist-name-capture',
        triggerAtProgress:    0.27, // ~4 seconds into the 15s scene
        priority:             4,
        dismissOnSceneChange: true,
      },
    ],
  },

  DISCOVERY: {
    id:              'DISCOVERY',
    label:           'Discovery',
    emotionalIntent: 'Asombro y exploración — el ecosistema VICMARG se despliega',
    durationMs:      20_000,
    nextScene:       'CONVERSION',
    gsapTimelineKey: 'discovery',
    videoManifestKey:'discovery',
    threeJSEnabled:  true, // Three.js hologram — Phase 3
    overlayTriggers: [
      {
        overlayId:            'services-hologram-menu',
        triggerAtProgress:    0.35, // After hologram establishes
        priority:             3,
        dismissOnSceneChange: true,
      },
      {
        overlayId:            'ecosystem-explorer',
        triggerAtProgress:    0.65, // Deeper exploration
        priority:             2,
        dismissOnSceneChange: true,
      },
    ],
  },

  CONVERSION: {
    id:              'CONVERSION',
    label:           'Conversion',
    emotionalIntent: 'Aspiración y decisión — el momento de transformación',
    durationMs:      12_000,
    nextScene:       null, // Terminal scene
    gsapTimelineKey: 'conversion',
    videoManifestKey:'conversion',
    threeJSEnabled:  false,
    overlayTriggers: [
      {
        overlayId:            'premium-cta',
        triggerAtProgress:    0.40, // CTA appears at midpoint
        priority:             5,    // Highest priority — conversion critical
        dismissOnSceneChange: false,// Stays visible
      },
    ],
  },
} as const

// ─── Scene Order ─────────────────────────────────────────────────────────────
export const SCENE_SEQUENCE = ['ARRIVAL', 'GREETING', 'DISCOVERY', 'CONVERSION'] as const

// ─── Scene Transition Durations ────────────────────────────────────────────
export const TRANSITION_CONFIG = {
  crossfadeDurationMs: 800,   // GSAP crossfade — zero black frames
  lockDurationMs:      900,   // Scene locked during + 100ms buffer
  preloadTrigger:      0.60,  // Preload next at 60% of current
} as const
