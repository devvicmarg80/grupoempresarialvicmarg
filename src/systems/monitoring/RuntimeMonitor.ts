// RuntimeMonitor — runtime health telemetry for the VICMARG cinematic engine.
// Subscribes to EventBus for all runtime events; polls ScrollTrigger every 2s.
// Writes to useMonitorStore. Decoupled: never imports other systems directly.
// In production: metrics are collected but DevRuntimePanel renders nothing.

import { ScrollTrigger }   from 'gsap/ScrollTrigger'
import { eventBus }        from '@lib/event-bus'
import { useMonitorStore } from '@store/monitor.store'

class RuntimeMonitorClass {
  private pollInterval:  ReturnType<typeof setInterval> | null = null
  private memInterval:   ReturnType<typeof setInterval> | null = null
  private initialized    = false
  private readonly cleanupFns: Array<() => void> = []

  init(): void {
    if (this.initialized) return

    // ── Animation context lifecycle (from AnimationOrchestrator) ────────────
    const unsubCtxStart = eventBus.on('animation:timeline:start', () => {
      useMonitorStore.getState().incrementTimelines()
    })
    const unsubCtxKilled = eventBus.on('animation:timeline:killed', () => {
      useMonitorStore.getState().decrementTimelines()
    })

    // ── Scene transitions ────────────────────────────────────────────────────
    const unsubTransStart = eventBus.on('scene:transition:start', ({ from, to }) => {
      useMonitorStore.getState().logTransitionStart(from, to)
    })
    const unsubTransComplete = eventBus.on('scene:transition:complete', ({ scene, duration }) => {
      useMonitorStore.getState().logTransitionComplete(scene, duration)
    })

    // ── Video state tracking ─────────────────────────────────────────────────
    const unsubVLoad    = eventBus.on('video:loading',          ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'loading')    })
    const unsubVPlay    = eventBus.on('video:playing',          ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'playing')    })
    const unsubVPause   = eventBus.on('video:paused',           ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'paused')     })
    const unsubVBuffer  = eventBus.on('video:buffering',        ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'buffering')  })
    const unsubVPre     = eventBus.on('video:preload:start',    ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'preloading') })
    const unsubVPreOk   = eventBus.on('video:preload:complete', ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'preloaded')  })
    const unsubVErr     = eventBus.on('video:error',            ({ sceneId }) => { useMonitorStore.getState().setVideoState(sceneId, 'error')      })

    // ── Overlay tracking ─────────────────────────────────────────────────────
    const unsubOvOpen  = eventBus.on('overlay:open',   ({ overlayId }) => { useMonitorStore.getState().setOverlayActive(overlayId, true)  })
    const unsubOvClose = eventBus.on('overlay:closed', ({ overlayId }) => { useMonitorStore.getState().setOverlayActive(overlayId, false) })

    // ── FPS degradation ──────────────────────────────────────────────────────
    const unsubFPSDrop = eventBus.on('performance:fps:drop', ({ fps, threshold }) => {
      useMonitorStore.getState().logFPSDrop({ fps, threshold, timestamp: Date.now() })
    })

    // ── ScrollTrigger count poll (no EventBus equivalent) ────────────────────
    this.pollInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        useMonitorStore.getState().setScrollTriggerCount(ScrollTrigger.getAll().length)
      }
    }, 2000)

    // ── JS heap memory poll (Chrome only — undefined in Safari/Firefox) ──────
    this.memInterval = setInterval(() => {
      const mem = (performance as unknown as Record<string, unknown>).memory as
        | { usedJSHeapSize: number; jsHeapSizeLimit: number }
        | undefined
      if (mem) {
        const usedMB = Math.round(mem.usedJSHeapSize / (1024 * 1024))
        useMonitorStore.getState().setMemoryUsage(usedMB)
      }
    }, 5000)

    this.cleanupFns.push(
      unsubCtxStart, unsubCtxKilled,
      unsubTransStart, unsubTransComplete,
      unsubVLoad, unsubVPlay, unsubVPause, unsubVBuffer,
      unsubVPre, unsubVPreOk, unsubVErr,
      unsubOvOpen, unsubOvClose,
      unsubFPSDrop,
    )

    this.initialized = true
  }

  destroy(): void {
    if (!this.initialized) return
    if (this.pollInterval !== null) { clearInterval(this.pollInterval); this.pollInterval = null }
    if (this.memInterval  !== null) { clearInterval(this.memInterval);  this.memInterval  = null }
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.initialized = false
  }

  get isReady(): boolean { return this.initialized }
}

export const RuntimeMonitor = new RuntimeMonitorClass()
