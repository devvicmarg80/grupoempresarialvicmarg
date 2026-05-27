'use client'

import { useEffect } from 'react'
import { deviceCapabilityDetector } from '@systems/performance/DeviceCapabilityDetector'
import { usePerformanceStore } from '@store/performance.store'
import { useOverlayStore } from '@store/overlay.store'
import { eventBus } from '@lib/event-bus'
import { TIER_BUDGETS, FPS_THRESHOLDS } from '@config/performance.config'

/**
 * Runs device detection on client mount (non-blocking).
 * Initializes the FPS monitor loop for the full session.
 * Updates overlay max-simultaneous limit from the detected device tier.
 */
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Device detection — writes to performanceStore and emits detection:complete
    void deviceCapabilityDetector.detect().then((capabilities) => {
      const budget = TIER_BUDGETS[capabilities.tier]
      useOverlayStore.getState().setMaxSimultaneous(budget.maxSimultaneousOverlays)
    })

    // FPS monitor — 2-second rolling samples, triggers tier demotion on degradation
    let frames   = 0
    let lastTime = performance.now()
    let rafId:   number

    const measureFPS = (time: number) => {
      frames++
      const delta = time - lastTime

      if (delta >= FPS_THRESHOLDS.sampleWindow) {
        const fps   = Math.round((frames / delta) * 1000)
        const store = usePerformanceStore.getState()

        store.setCurrentFPS(fps)
        store.setAverageFPS(fps)

        if (fps < FPS_THRESHOLDS.degradation) {
          store.reduceTier()
          eventBus.emit('performance:fps:drop', { fps, threshold: FPS_THRESHOLDS.degradation })
        }

        frames   = 0
        lastTime = time
      }

      rafId = requestAnimationFrame(measureFPS)
    }

    rafId = requestAnimationFrame(measureFPS)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return <>{children}</>
}
