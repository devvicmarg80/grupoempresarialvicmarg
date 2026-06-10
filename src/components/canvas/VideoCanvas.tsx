'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useSceneStore, selectCurrentScene } from '@store/scene.store'
import { usePerformanceStore, selectIsDetected } from '@store/performance.store'
import { VideoEngine } from '@systems/video/VideoEngine'
import { VIDEO_MANIFESTS, SCENE_SEQUENCE } from '@config/scenes.config'

/**
 * Full-screen cinematic video background.
 * Scroll drives video.currentTime directly (scrubbing — no autonomous play).
 * All 4 scenes preloaded on detection so scrubbing is instant.
 */
export function VideoCanvas() {
  const currentScene = useSceneStore(selectCurrentScene)
  const isDetected   = usePerformanceStore(selectIsDetected)
  const [showHint, setShowHint]     = useState(true)
  const [hintFading, setHintFading] = useState(false)
  const hintDismissed = useRef(false)

  // Preload all 4 scenes once device detection resolves
  useEffect(() => {
    if (!isDetected) return
    SCENE_SEQUENCE.forEach((sceneId) => {
      void VideoEngine.loadScene(sceneId)
    })
  }, [isDetected])

  // Dismiss scroll hint on first window scroll
  useEffect(() => {
    function onFirstScroll() {
      if (hintDismissed.current) return
      hintDismissed.current = true
      setHintFading(true)
      setTimeout(() => setShowHint(false), 600)
      window.removeEventListener('scroll', onFirstScroll)
    }
    window.addEventListener('scroll', onFirstScroll, { passive: true })
    return () => window.removeEventListener('scroll', onFirstScroll)
  }, [])

  // iOS/touch — unlock audio for AI receptionist
  const unlockAutoplay = useCallback(() => {
    VideoEngine.unlockAutoplay()
  }, [])

  useEffect(() => {
    document.addEventListener('touchstart', unlockAutoplay, { once: true, passive: true })
    document.addEventListener('click',      unlockAutoplay, { once: true })
    return () => {
      document.removeEventListener('touchstart', unlockAutoplay)
      document.removeEventListener('click',      unlockAutoplay)
    }
  }, [unlockAutoplay])

  return (
    <>
      {/* Video layer — fixed, full-screen */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 10, backgroundColor: '#0d0d1f' }}
        aria-hidden="true"
      >
        {SCENE_SEQUENCE.map((sceneId) => {
          const manifest = VIDEO_MANIFESTS[sceneId.toLowerCase()]
          const isActive = sceneId === currentScene

          return (
            <div
              key={sceneId}
              className="absolute inset-0"
              style={{
                opacity:       isActive ? 1 : 0,
                transition:    'opacity 800ms cubic-bezier(0.76, 0, 0.24, 1)',
                willChange:    'opacity',
                pointerEvents: 'none',
              }}
            >
              {manifest?.posterBlurUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={manifest.posterBlurUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="eager"
                  aria-hidden="true"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              )}

              <video
                ref={(el) => {
                  if (el) VideoEngine.attachElement(sceneId, el)
                  else    VideoEngine.detachElement(sceneId)
                }}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload={sceneId === 'ARRIVAL' ? 'auto' : 'metadata'}
                poster={manifest?.posterUrl}
                aria-hidden="true"
              />
            </div>
          )
        })}
      </div>

      {/* Scroll hint — visible before first scroll interaction */}
      {showHint && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-between pointer-events-none select-none"
          style={{
            zIndex:     26,
            opacity:    hintFading ? 0 : 1,
            transition: 'opacity 600ms ease',
          }}
        >
          {/* VICMARG brand — top center */}
          <div className="flex flex-col items-center pt-20 gap-2">
            <div
              className="h-px w-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            />
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/20 font-mono">
              Grupo Empresarial
            </p>
            <h1
              className="text-5xl md:text-6xl text-white/60"
              style={{ fontFamily: 'var(--font-cinematic)', fontWeight: 300, letterSpacing: '-0.03em' }}
            >
              VICMARG
            </h1>
            <div
              className="h-px w-12"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
            />
          </div>

          {/* Scroll indicator — bottom center */}
          <div className="flex flex-col items-center pb-14 gap-3">
            <span className="text-[9px] uppercase tracking-[0.24em] text-white/25 font-mono">
              Desplázate para explorar
            </span>
            <div
              className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
              style={{ border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <div
                className="w-px h-2.5 rounded-full bg-white/25 animate-bounce"
                style={{ animationDuration: '1.8s' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
