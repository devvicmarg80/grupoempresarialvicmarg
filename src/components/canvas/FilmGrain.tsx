'use client'

// FilmGrain — classic cinematic film-grain texture overlay.
// Technique from shader.se: generated noise canvas shifted per frame via
// CSS animation. Almost imperceptible (3.5% opacity) but gives the dark
// background depth and a premium analog feel.
// z-50: topmost visual layer, never blocks interaction.

import { useEffect, useRef } from 'react'

export function FilmGrain() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Build a 256×256 monochrome noise tile once
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width  = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = ctx.createImageData(size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(Math.random() * 256)
      img.data[i]     = v
      img.data[i + 1] = v
      img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)

    ref.current.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none vicmarg-grain"
      style={{
        zIndex:           50,
        backgroundRepeat: 'repeat',
        backgroundSize:   '256px 256px',
        opacity:          0.035,
        mixBlendMode:     'overlay',
      }}
    />
  )
}
