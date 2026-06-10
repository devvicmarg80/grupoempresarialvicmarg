// VideoEngine — scroll-driven video for the 4 cinematic scenes.
// Singleton: import { VideoEngine } from '@systems/video/VideoEngine'
// Scroll position maps to video.currentTime (scrubbing).
// No autonomous playback — the scroll wheel controls every frame.

import Hls from 'hls.js'
import { eventBus } from '@lib/event-bus'
import { useVideoStore } from '@store/video.store'
import { usePerformanceStore } from '@store/performance.store'
import { useUserStore } from '@store/user.store'
import { VIDEO_MANIFESTS } from '@config/scenes.config'
import { HLS_CONFIGS, VIDEO_MEMORY_BUDGET } from '@config/performance.config'
import type { DeviceTier, MobileVideoStrategy } from '@types-app'

class VideoEngineClass {
  private readonly videoElements = new Map<string, HTMLVideoElement>()
  private readonly hlsInstances  = new Map<string, Hls>()
  private readonly loadedScenes  = new Set<string>()
  private initialized      = false
  private readonly cleanupFns: Array<() => void> = []

  // RAF throttle: batch scroll events, seek at most once per animation frame
  private rafHandle: number | null = null
  private pendingScrub: { sceneId: string; progress: number } | null = null

  init(): void {
    if (this.initialized) return

    const unsubDetection = eventBus.on('performance:detection:complete', () => {
      this.applyMobileStrategy()
    })

    // Scroll scrubbing — RAF-throttled so we seek at most 60x/second
    const unsubScrub = eventBus.on('scene:progress:update', ({ scene, progress }) => {
      this.queueScrub(scene, progress)
    })

    // Pre-load next scene when approaching end of current one
    const unsubProgress = eventBus.on('scene:progress:update', ({ scene, progress }) => {
      if (progress < VIDEO_MEMORY_BUDGET.preloadTriggerProgress) return
      const next = this.getNextSceneId(scene)
      if (next && !this.loadedScenes.has(next)) {
        void this.loadScene(next)
      }
    })

    // Scene transition: load next scene, no autonomous play (scrubbing handles it)
    const unsubTransitionStart = eventBus.on('scene:transition:start', ({ to }) => {
      void this.loadScene(to)
    })

    this.cleanupFns.push(unsubDetection, unsubScrub, unsubProgress, unsubTransitionStart)
    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'VideoEngine' })
  }

  attachElement(sceneId: string, el: HTMLVideoElement): void {
    this.videoElements.set(sceneId, el)
  }

  detachElement(sceneId: string): void {
    this.destroyHLS(sceneId)
    this.loadedScenes.delete(sceneId)
    this.videoElements.delete(sceneId)
  }

  async loadScene(sceneId: string): Promise<void> {
    const manifest = VIDEO_MANIFESTS[sceneId.toLowerCase()]
    if (!manifest) return

    const el = this.videoElements.get(sceneId)
    if (!el) return

    if (this.loadedScenes.has(sceneId)) return

    const { mobileStrategy } = useVideoStore.getState()
    const { deviceTier }     = usePerformanceStore.getState()

    useVideoStore.getState().setActiveVideo(sceneId)
    useVideoStore.getState().setPlaybackState('loading')
    eventBus.emit('video:loading', { sceneId })

    const isMp4 = manifest.masterPlaylistUrl.endsWith('.mp4')

    if (isMp4 || mobileStrategy === 'native-hls') {
      el.src = manifest.masterPlaylistUrl
      el.preload  = 'auto'   // upgrade from 'metadata' to 'auto' when actively loading
      el.load()
      this.loadedScenes.add(sceneId)
      this.attachNativeListeners(sceneId, el)
    } else if (typeof window !== 'undefined' && Hls.isSupported()) {
      this.loadWithHLS(sceneId, el, manifest.masterPlaylistUrl, deviceTier)
      this.loadedScenes.add(sceneId)
    } else {
      useVideoStore.getState().setPlaybackState('paused')
    }
  }

  // Play is only used to unlock audio on user gesture — not for scroll mode
  async play(sceneId: string): Promise<void> {
    const el = this.videoElements.get(sceneId)
    if (!el) return
    el.muted       = true
    el.playsInline = true
    try {
      await el.play()
      useVideoStore.getState().setPlaybackState('playing')
      eventBus.emit('video:playing', { sceneId, currentTime: el.currentTime })
    } catch {
      useVideoStore.getState().setPlaybackState('paused')
    }
  }

  pause(sceneId: string): void {
    const el = this.videoElements.get(sceneId)
    if (!el) return
    el.pause()
    useVideoStore.getState().setPlaybackState('paused')
    eventBus.emit('video:paused', { sceneId })
  }

  unlockAutoplay(): void {
    useUserStore.getState().setInteracted(true)
    eventBus.emit('user:first:interaction', {})
  }

  destroy(): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle)
      this.rafHandle = null
    }
    this.pendingScrub = null
    this.hlsInstances.forEach((hls) => hls.destroy())
    this.hlsInstances.clear()
    this.loadedScenes.clear()
    this.videoElements.clear()
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'VideoEngine' })
  }

  get isReady(): boolean {
    return this.initialized
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  // Queue a scrub; coalesce multiple scroll events into one seek per animation frame
  private queueScrub(sceneId: string, progress: number): void {
    this.pendingScrub = { sceneId, progress }
    if (this.rafHandle !== null) return
    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null
      const pending = this.pendingScrub
      if (!pending) return
      this.pendingScrub = null
      this.executeScrub(pending.sceneId, pending.progress)
    })
  }

  private executeScrub(sceneId: string, progress: number): void {
    const manifest = VIDEO_MANIFESTS[sceneId.toLowerCase()]
    if (!manifest) return
    const el = this.videoElements.get(sceneId)
    if (!el || el.readyState < 2) return

    const duration   = manifest.durationMs / 1000
    const targetTime = Math.min(Math.max(progress * duration, 0), duration - 0.05)

    // Only seek if change is meaningful (reduces stutter on micro-scrolls)
    if (Math.abs(el.currentTime - targetTime) > 0.08) {
      el.currentTime = targetTime
    }
  }

  private loadWithHLS(
    sceneId:  string,
    el:       HTMLVideoElement,
    url:      string,
    tier:     DeviceTier,
  ): void {
    this.destroyHLS(sceneId)

    const cfg = HLS_CONFIGS[tier]
    const hls = new Hls({
      maxBufferLength:         cfg.maxBufferLength,
      maxBufferSize:           cfg.maxBufferSize,
      startLevel:              cfg.startLevel,
      enableWorker:            true,
      lowLatencyMode:          false,
      fragLoadingMaxRetry:     cfg.fragLoadingMaxRetry,
      manifestLoadingMaxRetry: cfg.manifestLoadingMaxRetry,
    })

    hls.once(Hls.Events.MANIFEST_PARSED, () => {
      useVideoStore.getState().setPlaybackState('buffering')
    })

    el.addEventListener('canplay', () => {
      useVideoStore.getState().setBufferProgress(0.2)
    }, { once: true })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return
      const err = String(data.details)
      eventBus.emit('video:error', { sceneId, error: err, fatal: true })
      useVideoStore.getState().setError(err)
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad()
      } else {
        this.destroyHLS(sceneId)
      }
    })

    hls.loadSource(url)
    hls.attachMedia(el)
    this.hlsInstances.set(sceneId, hls)
  }

  private attachNativeListeners(sceneId: string, el: HTMLVideoElement): void {
    el.addEventListener('canplay', () => {
      useVideoStore.getState().setPlaybackState('buffering')
      useVideoStore.getState().setBufferProgress(0.2)
    }, { once: true })

    el.addEventListener('error', () => {
      const err = el.error?.message ?? 'native_error'
      useVideoStore.getState().setError(err)
      eventBus.emit('video:error', { sceneId, error: err, fatal: false })
    }, { once: true })
  }

  private applyMobileStrategy(): void {
    const { capabilities } = usePerformanceStore.getState()
    if (!capabilities) return

    let strategy: MobileVideoStrategy = 'hls'
    if (capabilities.isIOS || capabilities.isSafari) {
      strategy = 'native-hls'
    } else if (typeof window !== 'undefined' && !Hls.isSupported()) {
      strategy = 'poster-fallback'
    }
    useVideoStore.getState().setMobileStrategy(strategy)
  }

  private destroyHLS(sceneId: string): void {
    const hls = this.hlsInstances.get(sceneId)
    if (!hls) return
    hls.destroy()
    this.hlsInstances.delete(sceneId)
  }

  private getNextSceneId(sceneId: string): string | null {
    const order = ['ARRIVAL', 'GREETING', 'DISCOVERY', 'CONVERSION']
    const idx   = order.indexOf(sceneId)
    return idx >= 0 && idx < order.length - 1 ? (order[idx + 1] ?? null) : null
  }
}

export const VideoEngine = new VideoEngineClass()
