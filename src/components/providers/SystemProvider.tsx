'use client'

import { useEffect } from 'react'
import { GSAPRegistry }          from '@systems/animation/GSAPRegistry'
import { VideoEngine }           from '@systems/video/VideoEngine'
import { SceneManager }          from '@systems/scene/SceneManager'
import { ScrollNarrativeSystem } from '@systems/scroll/ScrollNarrativeSystem'
import { AnimationOrchestrator } from '@systems/animation/AnimationOrchestrator'
import { OverlaySystem }         from '@systems/overlay/OverlaySystem'
import { RuntimeMonitor }        from '@systems/monitoring/RuntimeMonitor'
import { GPUMonitor }            from '@systems/monitoring/GPUMonitor'

/**
 * Boot order (dependency graph):
 *  1. GSAPRegistry         — registers plugins before any tween
 *  2. VideoEngine          — HLS + EventBus preload/transition subscriptions
 *  3. SceneManager         — FSM, subscribes to scroll:scene:threshold
 *  4. ScrollNarrativeSystem — emits scroll/scene events, reads DOM (#scroll-narrative)
 *  5. AnimationOrchestrator — needs GSAP, subscribes to scene:transition:*
 *  6. OverlaySystem        — reads scene progress, fires overlay triggers
 *  7. RuntimeMonitor       — last; subscribes to all events for observability
 *
 * Cleanup runs in reverse order to prevent dangling subscriptions.
 */
export function SystemProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    GSAPRegistry.init()
    GPUMonitor.init()
    VideoEngine.init()
    SceneManager.init()
    ScrollNarrativeSystem.init()
    AnimationOrchestrator.init()
    OverlaySystem.init()
    RuntimeMonitor.init()

    return () => {
      RuntimeMonitor.destroy()
      OverlaySystem.destroy()
      AnimationOrchestrator.destroy()
      ScrollNarrativeSystem.destroy()
      SceneManager.destroy()
      VideoEngine.destroy()
      GPUMonitor.destroy()
      GSAPRegistry.destroy()
    }
  }, [])

  return <>{children}</>
}
