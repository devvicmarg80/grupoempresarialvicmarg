'use client'

import { useEffect } from 'react'
import { GSAPRegistry }          from '@systems/animation/GSAPRegistry'
import { VideoEngine }           from '@systems/video/VideoEngine'
import { SceneManager }          from '@systems/scene/SceneManager'
import { ScrollNarrativeSystem } from '@systems/scroll/ScrollNarrativeSystem'
import { AnimationOrchestrator } from '@systems/animation/AnimationOrchestrator'
import { OverlaySystem }         from '@systems/overlay/OverlaySystem'

/**
 * Boot order (dependency graph):
 *  1. GSAPRegistry      — registers plugins before any tween
 *  2. VideoEngine       — HLS + EventBus preload subscriptions
 *  3. SceneManager      — FSM, subscribes to scroll:scene:threshold
 *  4. ScrollNarrativeSystem — emits scroll/scene events, needs DOM ready
 *  5. AnimationOrchestrator — needs GSAP, subscribes to scene:transition:*
 *  6. OverlaySystem     — last, reads scene progress from above
 *
 * Cleanup runs in reverse order.
 */
export function SystemProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    GSAPRegistry.init()
    VideoEngine.init()
    SceneManager.init()
    ScrollNarrativeSystem.init()
    AnimationOrchestrator.init()
    OverlaySystem.init()

    return () => {
      OverlaySystem.destroy()
      AnimationOrchestrator.destroy()
      ScrollNarrativeSystem.destroy()
      SceneManager.destroy()
      VideoEngine.destroy()
      GSAPRegistry.destroy()
    }
  }, [])

  return <>{children}</>
}
