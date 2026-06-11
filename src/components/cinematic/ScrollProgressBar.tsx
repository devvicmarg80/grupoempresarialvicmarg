'use client'

// ScrollProgressBar — 1px cinematic progress line at very top of viewport.
// z-60: above everything including FilmGrain (z-50).
// Color transitions from cobalt (ARRIVAL/GREETING/DISCOVERY) to gold (CONVERSION).
// Width is driven by window.scrollY, NOT React re-renders — pure RAF for perf.

import { useEffect, useRef } from 'react'
import { useSceneStore }     from '@store/scene.store'

export function ScrollProgressBar() {
  const barRef     = useRef<HTMLDivElement>(null)
  const rafRef     = useRef<number | null>(null)
  const currentScene = useSceneStore((s) => s.currentScene)
  const isConversion = currentScene === 'CONVERSION'

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    function update() {
      rafRef.current = null
      const scrollY  = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll <= 0) return
      const pct = Math.min(100, (scrollY / maxScroll) * 100)
      if (bar) bar.style.width = pct + '%'
    }

    function onScroll() {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{ zIndex: 60, height: '1px', background: 'rgba(255,255,255,0.04)' }}
    >
      <div
        ref={barRef}
        className="h-full"
        style={{
          width:      '0%',
          background: isConversion
            ? 'linear-gradient(90deg, rgba(245,158,11,0.3), rgba(245,158,11,0.9))'
            : 'linear-gradient(90deg, rgba(37,99,235,0.3), rgba(96,165,250,0.9))',
          boxShadow: isConversion
            ? '0 0 8px rgba(245,158,11,0.5)'
            : '0 0 8px rgba(96,165,250,0.5)',
          transition: 'background 800ms ease, box-shadow 800ms ease',
        }}
      />
    </div>
  )
}
