'use client'

import { useEffect } from 'react'
import { GSAPRegistry } from '@systems/animation/GSAPRegistry'
import { VideoEngine } from '@systems/video/VideoEngine'

/**
 * Initializes core systems in dependency order on client mount.
 * GSAPRegistry must be first — registers GSAP plugins before any tween call.
 * VideoEngine second — sets up EventBus subscriptions for preloading.
 * Cleanup destroys systems in reverse order on unmount.
 */
export function SystemProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    GSAPRegistry.init()
    VideoEngine.init()

    return () => {
      VideoEngine.destroy()
      GSAPRegistry.destroy()
    }
  }, [])

  return <>{children}</>
}
