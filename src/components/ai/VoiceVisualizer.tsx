'use client'

// VoiceVisualizer — animated breathing/pulsing circle responding to AI state.
// Uses canvas for real-time visual. No external dependencies.
// States: idle (slow breathe) | listening (blue pulse) | speaking (cobalt pulse) | thinking (gentle spin)

import { useEffect, useRef }    from 'react'
import { useAIStore }            from '@store/ai.store'

const SIZE       = 80   // px
const CENTER     = SIZE / 2
const BASE_R     = 22
const PULSE_R    = 32

const COLORS = {
  idle:        'rgba(96,165,250,0.25)',
  listening:   'rgba(96,165,250,0.65)',
  thinking:    'rgba(147,197,253,0.40)',
  speaking:    'rgba(59,130,246,0.75)',
  error:       'rgba(248,113,113,0.55)',
} as const

export function VoiceVisualizer() {
  const canvasRef        = useRef<HTMLCanvasElement>(null)
  const conversationState = useAIStore((s) => s.conversationState)
  const rafRef           = useRef<number | null>(null)
  const tRef             = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = (time: number) => {
      tRef.current = time * 0.001
      const t = tRef.current

      ctx.clearRect(0, 0, SIZE, SIZE)

      const state = conversationState

      // Outer ring — always present, slow breathe
      const outerR  = BASE_R + Math.sin(t * 0.8) * 3
      const outerAlpha = state === 'listening' ? 0.35 : state === 'speaking' ? 0.50 : 0.18
      ctx.beginPath()
      ctx.arc(CENTER, CENTER, outerR + 10, 0, Math.PI * 2)
      ctx.strokeStyle = state === 'speaking' ? 'rgba(59,130,246,0.25)' : 'rgba(96,165,250,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Mid ring — pulsing on activity
      if (state === 'listening' || state === 'speaking') {
        const midPulse = state === 'listening'
          ? BASE_R + Math.sin(t * 3.5) * 8
          : BASE_R + Math.sin(t * 2.2) * 6
        ctx.beginPath()
        ctx.arc(CENTER, CENTER, midPulse, 0, Math.PI * 2)
        ctx.strokeStyle = state === 'listening'
          ? 'rgba(96,165,250,0.45)'
          : 'rgba(59,130,246,0.55)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Core circle
      const coreR = state === 'idle' || state === 'ready'
        ? BASE_R + Math.sin(t * 0.6) * 1.5
        : state === 'listening'
          ? BASE_R + Math.sin(t * 4) * 5
          : state === 'speaking'
            ? PULSE_R - 8 + Math.sin(t * 2.8) * 4
            : state === 'thinking'
              ? BASE_R + Math.sin(t * 1.5) * 2
              : BASE_R

      const gradient = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, coreR)
      gradient.addColorStop(0, state === 'speaking' ? 'rgba(96,165,250,0.9)' : 'rgba(59,130,246,0.7)')
      gradient.addColorStop(0.6, COLORS[state as keyof typeof COLORS] ?? COLORS.idle)
      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.beginPath()
      ctx.arc(CENTER, CENTER, coreR, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Thinking: rotating arc
      if (state === 'thinking') {
        ctx.beginPath()
        ctx.arc(CENTER, CENTER, BASE_R + 8, t * 2, t * 2 + Math.PI * 1.2)
        ctx.strokeStyle = 'rgba(147,197,253,0.55)'
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [conversationState])

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      style={{
        display:       'block',
        imageRendering: 'auto',
      }}
      aria-hidden="true"
    />
  )
}
