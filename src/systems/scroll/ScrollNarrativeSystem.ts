// ScrollNarrativeSystem — scroll → scene progress via native scroll + GSAP proxy.
// Emits: scroll:progress, scroll:scene:threshold, scene:progress:update
// Writes: useSceneStore.setProgress() (per-scene 0→1)
// Proxy registration enables Phase 4 scrub animations on #scroll-narrative.

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { eventBus }      from '@lib/event-bus'
import { useSceneStore } from '@store/scene.store'
import { SCENE_SEQUENCE } from '@config/scenes.config'
import type { SceneId }  from '@types-app'

const SCROLLER_ID  = 'scroll-narrative'
const TOTAL_SCENES = 4

class ScrollNarrativeSystemClass {
  private scrollerEl:     HTMLElement | null = null
  private prevSceneIndex  = 0
  private lastScrollY     = 0
  private lastScrollTime  = 0
  private initialized     = false
  private readonly cleanupFns: Array<() => void> = []

  init(): void {
    if (this.initialized || typeof window === 'undefined') return

    const scroller = document.getElementById(SCROLLER_ID)
    if (!scroller) {
      console.warn('[ScrollNarrativeSystem] #scroll-narrative not found')
      return
    }

    this.scrollerEl = scroller

    const handleScroll = (): void => { this.onScroll() }
    scroller.addEventListener('scroll', handleScroll, { passive: true })
    this.cleanupFns.push(() => scroller.removeEventListener('scroll', handleScroll))

    // GSAP proxy — Phase 4 scrub animations reference this scroller by element
    ScrollTrigger.scrollerProxy(scroller, {
      scrollTop(value?: number): number {
        if (value !== undefined) { scroller.scrollTop = value }
        return scroller.scrollTop
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })
    ScrollTrigger.refresh()

    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'ScrollNarrativeSystem' })
  }

  destroy(): void {
    if (!this.initialized) return
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.scrollerEl     = null
    this.prevSceneIndex = 0
    this.initialized    = false
    eventBus.emit('system:destroyed', { systemName: 'ScrollNarrativeSystem' })
  }

  get isReady(): boolean { return this.initialized }

  // ─── Private ──────────────────────────────────────────────────────────────

  private onScroll(): void {
    const el = this.scrollerEl
    if (!el) return

    const scrollHeight = el.scrollHeight - el.clientHeight
    if (scrollHeight <= 0) return

    const now        = performance.now()
    const deltaY     = el.scrollTop - this.lastScrollY
    const deltaT     = now - this.lastScrollTime
    const velocityY  = deltaT > 0 ? (deltaY / deltaT) * 1000 : 0

    this.lastScrollY    = el.scrollTop
    this.lastScrollTime = now

    const progress      = Math.max(0, Math.min(1, el.scrollTop / scrollHeight))
    const sceneIndex    = Math.min(Math.floor(progress * TOTAL_SCENES), TOTAL_SCENES - 1)
    const sceneProgress = Math.max(0, Math.min(1, (progress * TOTAL_SCENES) - sceneIndex))
    const sceneId       = SCENE_SEQUENCE[sceneIndex] as SceneId | undefined

    if (!sceneId) return

    eventBus.emit('scroll:progress', { progress, velocityY })
    useSceneStore.getState().setProgress(sceneProgress)
    eventBus.emit('scene:progress:update', { scene: sceneId, progress: sceneProgress })

    if (sceneIndex !== this.prevSceneIndex) {
      const direction = sceneIndex > this.prevSceneIndex ? 'forward' : 'backward'
      this.prevSceneIndex = sceneIndex
      eventBus.emit('scroll:scene:threshold', { scene: sceneId, direction })
    }
  }
}

export const ScrollNarrativeSystem = new ScrollNarrativeSystemClass()
