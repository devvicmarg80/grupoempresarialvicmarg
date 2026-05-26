// ─── VICMARG Video Types ────────────────────────────────────────────────────
// VideoEngine contracts: HLS streaming, preload budget, mobile strategy.
// All videos generated with Veo 3.1: first-person, anamorphic, 24fps, ACES.
// ───────────────────────────────────────────────────────────────────────────

/** Available HLS quality levels */
export type VideoQuality = '1080p' | '720p' | '480p' | '360p'

/** VideoEngine internal playback state machine */
export type PlaybackState =
  | 'idle'       // No video loaded
  | 'loading'    // Fetching manifest/segments
  | 'buffering'  // Loaded but insufficient buffer
  | 'playing'    // Active playback
  | 'paused'     // User/system paused
  | 'stalled'    // Network stall (no data arriving)
  | 'ended'      // Playback complete
  | 'error'      // Unrecoverable error

/** Mobile strategy for iOS Safari's autoplay restrictions */
export type MobileVideoStrategy =
  | 'hls'              // Full HLS.js — desktop/Android
  | 'native-hls'       // Safari native HLS — iOS 15+
  | 'poster-fallback'  // No autoplay: poster frame + CSS animation
  | 'progressive'      // Direct MP4 for low-end devices

/** Cloudflare R2 + HLS manifest descriptor for one scene's video */
export interface VideoManifest {
  readonly sceneId: string
  readonly masterPlaylistUrl: string     // /videos/scenes/{id}/master.m3u8
  readonly posterUrl: string             // /videos/scenes/{id}/poster.avif
  readonly posterBlurUrl: string         // Low-res blur placeholder
  readonly durationMs: number
  readonly aspectRatio: '16:9' | '9:16' // Desktop | Mobile portrait
  readonly qualities: readonly VideoQuality[]
  readonly checksumSha256?: string       // Integrity verification
}

/** Zustand video store shape */
export interface VideoState {
  activeVideoId: string | null
  playbackState: PlaybackState
  qualityLevel: VideoQuality
  bufferProgress: number          // 0.0–1.0 (loaded ahead)
  currentTime: number             // Seconds
  duration: number                // Seconds
  preloadQueue: readonly string[] // Scene IDs queued for preload
  mobileStrategy: MobileVideoStrategy
  stallCount: number              // Triggers tier demotion at > 3
  lastStallAt: number | null      // Timestamp
  error: string | null
}

/** Zustand video store actions */
export interface VideoActions {
  setActiveVideo: (id: string | null) => void
  setPlaybackState: (state: PlaybackState) => void
  setQuality: (quality: VideoQuality) => void
  setBufferProgress: (progress: number) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  addToPreloadQueue: (sceneId: string) => void
  removeFromPreloadQueue: (sceneId: string) => void
  setMobileStrategy: (strategy: MobileVideoStrategy) => void
  incrementStallCount: () => void
  resetStallCount: () => void
  setError: (error: string | null) => void
  reset: () => void
}

/** HLS.js configuration per device tier */
export interface HLSEngineConfig {
  readonly maxBufferLength: number      // Seconds of ahead buffer
  readonly maxBufferSize: number        // Max bytes in buffer (e.g. 60MB)
  readonly startLevel: number           // -1 = auto ABR
  readonly abrEnabled: boolean
  readonly fragLoadingMaxRetry: number
  readonly manifestLoadingMaxRetry: number
}

/** Preloader budget — prevents GPU memory overflow */
export interface VideoMemoryBudget {
  readonly maxActiveVideos: number      // 2: current + preloading-next
  readonly maxBufferBytes: number       // 400MB default
  readonly preloadTriggerProgress: number // 0.6 = trigger at 60% of current
  readonly preloadAbortFPSThreshold: number // 50fps: abort if below
}
