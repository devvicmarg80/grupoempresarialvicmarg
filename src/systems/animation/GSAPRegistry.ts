// GSAP plugin registry — call GSAPRegistry.init() once in SystemProvider.
// Must initialize before any tween, ScrollTrigger, or Observer call in the tree.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import { GSAP_DEFAULTS } from '@config/animation.config'
import { eventBus } from '@lib/event-bus'

class GSAPRegistryClass {
  private initialized = false

  init(): void {
    if (this.initialized) return

    gsap.registerPlugin(ScrollTrigger, Observer)

    gsap.defaults({
      ease:      GSAP_DEFAULTS.ease,
      duration:  GSAP_DEFAULTS.duration,
      overwrite: GSAP_DEFAULTS.overwrite,
    })

    // Fast-forward all animations when OS prefers reduced motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      gsap.globalTimeline.timeScale(50)
    }

    this.initialized = true
    eventBus.emit('system:ready', { systemName: 'GSAPRegistry' })
  }

  destroy(): void {
    if (!this.initialized) return
    ScrollTrigger.killAll()
    gsap.globalTimeline.clear()
    this.initialized = false
    eventBus.emit('system:destroyed', { systemName: 'GSAPRegistry' })
  }

  get isReady(): boolean {
    return this.initialized
  }
}

export const GSAPRegistry = new GSAPRegistryClass()
