'use client'

import { useEffect, useCallback } from 'react'
import { useSceneStore, selectCurrentScene } from '@store/scene.store'
import { usePerformanceStore, selectIsDetected } from '@store/performance.store'
import { VideoEngine } from '@systems/video/VideoEngine'
import { VIDEO_MANIFESTS, SCENE_SEQUENCE } from '@config/scenes.config'

/**
 * Full-screen cinematic video background.
 * Manages 4 video elements (one per scene), crossfades via CSS opacity.
 * VideoEngine controls all HLS loading and playback state.
 * SceneManager (Phase 3) controls currentScene transitions.
 */
export function VideoCanvas() {
  const currentScene = useSceneStore(selectCurrentScene)
  const isDetected   = usePerformanceStore(selectIsDetected)

  // Load and play ARRIVAL once device detection resolves
  useEffect(() => {
    if (!isDetected) return
    void VideoEngine.loadScene('ARRIVAL').then(() => VideoEngine.play('ARRIVAL'))
  }, [isDetected])

  // iOS first-gesture unlock — enables audio for future AI receptionist
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
            {/* Low-res blur poster shown while HLS buffers */}
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
                if (el) {
                  VideoEngine.attachElement(sceneId, el)
                } else {
                  VideoEngine.detachElement(sceneId)
                }
              }}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              preload={isActive ? 'auto' : 'none'}
              poster={manifest?.posterUrl}
              aria-hidden="true"
            />
          </div>
        )
      })}
    </div>
  )
}
