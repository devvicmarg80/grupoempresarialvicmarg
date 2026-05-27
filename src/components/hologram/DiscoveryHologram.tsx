'use client'

// DiscoveryHologram — React mount point for the isolated HologramEngine runtime.
// Renders only when scene=DISCOVERY AND tier=HIGH (threeJSEnabled).
// mount/unmount driven exclusively by useEffect to keep Three.js lifecycle
// outside the React render cycle. z-30 sits above scroll-narrative (z-20)
// and below overlays (z-40). pointer-events:none — never blocks scroll.

import { useEffect, useRef }   from 'react'
import { useSceneStore }       from '@store/scene.store'
import { usePerformanceStore } from '@store/performance.store'
import { HologramEngine }      from '@systems/hologram/HologramEngine'

const CONTAINER_SIZE = 420  // px

export function DiscoveryHologram() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const currentScene  = useSceneStore((s) => s.currentScene)
  const threeJSEnabled = usePerformanceStore((s) => s.threeJSEnabled)

  const isActive = currentScene === 'DISCOVERY' && threeJSEnabled

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    HologramEngine.mount(containerRef.current)

    return () => {
      HologramEngine.unmount()
    }
  }, [isActive])

  if (!isActive) return null

  return (
    <div
      ref={containerRef}
      style={{
        position:       'fixed',
        top:            '50%',
        left:           '50%',
        transform:      'translate(-50%, -50%)',
        width:          CONTAINER_SIZE,
        height:         CONTAINER_SIZE,
        zIndex:         30,
        pointerEvents:  'none',
      }}
    />
  )
}
