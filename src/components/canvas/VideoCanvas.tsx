'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useSceneStore, selectCurrentScene }         from '@store/scene.store'
import { usePerformanceStore, selectIsDetected }     from '@store/performance.store'
import { VideoEngine }                               from '@systems/video/VideoEngine'
import { VIDEO_MANIFESTS, SCENE_SEQUENCE }           from '@config/scenes.config'
import { VicmargLogo }                               from '@components/brand/VicmargLogo'
import { gsap }                                      from 'gsap'

export function VideoCanvas() {
  const currentScene = useSceneStore(selectCurrentScene)
  const isDetected   = usePerformanceStore(selectIsDetected)
  const [showHint, setShowHint]     = useState(true)
  const [hintFading, setHintFading] = useState(false)
  const hintDismissed = useRef(false)
  const logoRef       = useRef<HTMLDivElement>(null)
  const titleRef      = useRef<HTMLHeadingElement>(null)
  const subRef        = useRef<HTMLParagraphElement>(null)
  const hintRef       = useRef<HTMLDivElement>(null)

  // Preload all 4 scenes once device detection resolves
  useEffect(() => {
    if (!isDetected) return
    SCENE_SEQUENCE.forEach((sceneId) => {
      void VideoEngine.loadScene(sceneId)
    })
  }, [isDetected])

  // GSAP cinematic entrance — staggered reveal from top
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    if (logoRef.current) {
      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: -24, filter: 'blur(6px)' },
        { opacity: 1, y: 0,   filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' },
        0,
      )
    }
    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 32,  filter: 'blur(8px)' },
        { opacity: 1, y: 0,   filter: 'blur(0px)', duration: 1.4, ease: 'power3.out' },
        0.2,
      )
    }
    if (subRef.current) {
      tl.fromTo(
        subRef.current,
        { opacity: 0, y: 14 },
        { opacity: 0.65, y: 0, duration: 0.9, ease: 'power2.out' },
        0.6,
      )
    }
    if (hintRef.current) {
      tl.fromTo(
        hintRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0,  duration: 0.9, ease: 'power2.out' },
        0.9,
      )
    }

    return () => { tl.kill() }
  }, [])

  // Dismiss scroll hint on first window scroll
  useEffect(() => {
    function onFirstScroll() {
      if (hintDismissed.current) return
      hintDismissed.current = true
      setHintFading(true)
      setTimeout(() => setShowHint(false), 700)
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
      {/* ── Video layer — fixed, full-screen ─────────────────────────── */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 10, backgroundColor: '#050508' }}
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
                transition:    'opacity 900ms cubic-bezier(0.76, 0, 0.24, 1)',
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

      {/* ── Hero HUD — visible before first scroll ──────────────────── */}
      {showHint && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-between pointer-events-none select-none"
          style={{
            zIndex:     26,
            opacity:    hintFading ? 0 : 1,
            transition: 'opacity 700ms ease',
          }}
        >
          {/* ── Logo + Brand — top center ────────────────────────────── */}
          <div
            ref={logoRef}
            className="flex flex-col items-center"
            style={{
              paddingTop: 'clamp(28px, 5vh, 52px)',
              opacity: 0,  // GSAP starts from 0
            }}
          >
            {/* Thin horizontal rule above logo */}
            <div
              className="h-px mb-4"
              style={{
                width:      '40px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              }}
            />

            {/* Logo mark */}
            <VicmargLogo size="lg" layout="vertical" subLabel="Grupo Empresarial" />

            <div
              className="h-px mt-4"
              style={{
                width:      '40px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.20), transparent)',
              }}
            />
          </div>

          {/* ── Center — tagline ─────────────────────────────────────── */}
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <h1
              ref={titleRef}
              style={{
                fontFamily:    'var(--font-cinematic)',
                fontWeight:    300,
                fontSize:      'clamp(13px, 2.2vw, 20px)',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.55)',
                lineHeight:    1.5,
                opacity:       0,  // GSAP starts from 0
              }}
            >
              Asesoría · Innovación · Transformación
            </h1>

            <p
              ref={subRef}
              style={{
                fontFamily:    'var(--font-display)',
                fontSize:      'clamp(10px, 1.1vw, 12px)',
                letterSpacing: '0.06em',
                color:         'rgba(255,255,255,0.32)',
                opacity:       0,  // GSAP starts from 0
              }}
            >
              Colombia · Latinoamérica
            </p>
          </div>

          {/* ── Scroll indicator — bottom center ─────────────────────── */}
          <div
            ref={hintRef}
            className="flex flex-col items-center"
            style={{
              paddingBottom: 'clamp(32px, 6vh, 56px)',
              opacity:       0,  // GSAP starts from 0
            }}
          >
            <span
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '9px',
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                color:         'rgba(255,255,255,0.55)',
                marginBottom:  '12px',
              }}
            >
              Desplázate para explorar
            </span>

            {/* Mouse wheel indicator */}
            <div
              style={{
                width:        '20px',
                height:       '34px',
                borderRadius: '10px',
                border:       '1px solid rgba(255,255,255,0.30)',
                display:      'flex',
                alignItems:   'flex-start',
                justifyContent: 'center',
                paddingTop:   '5px',
              }}
            >
              <div
                className="vicmarg-scroll-dot"
                style={{
                  width:        '3px',
                  height:       '8px',
                  borderRadius: '2px',
                  background:   'rgba(255,255,255,0.65)',
                }}
              />
            </div>

            {/* Chevron arrows */}
            <div className="flex flex-col items-center gap-0 mt-3">
              {[0.8, 0.5, 0.25].map((op, i) => (
                <svg
                  key={i}
                  width="12"
                  height="7"
                  viewBox="0 0 12 7"
                  fill="none"
                  style={{ opacity: op }}
                >
                  <path d="M1 1L6 6L11 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
