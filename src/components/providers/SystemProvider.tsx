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
import { AudioEngine }           from '@systems/audio/AudioEngine'
import { SessionOrchestrator }   from '@systems/ai/SessionOrchestrator'

/**
 * Boot order (dependency graph):
 *  1. GSAPRegistry         — registers plugins before any tween
 *  2. GPUMonitor           — one-time WebGL probe
 *  3. VideoEngine          — HLS + EventBus preload/transition subscriptions
 *  4. SceneManager         — FSM, subscribes to scroll:scene:threshold
 *  5. ScrollNarrativeSystem — emits scroll/scene events, reads DOM (#scroll-narrative)
 *  6. AnimationOrchestrator — needs GSAP, subscribes to scene:transition:*
 *  7. OverlaySystem        — reads scene progress, fires overlay triggers
 *  8. AudioEngine          — Web Audio API ambient layer (suspended until user gesture)
 *  9. SessionOrchestrator  — AI session lifecycle (gate: NEXT_PUBLIC_AI_ENABLED)
 * 10. RuntimeMonitor       — last; subscribes to all events for observability
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
    AudioEngine.init()
    SessionOrchestrator.init()
    RuntimeMonitor.init()

    return () => {
      RuntimeMonitor.destroy()
      SessionOrchestrator.destroy()
      AudioEngine.destroy()
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
