'use client'

// AIReceptionistOverlay — premium AI receptionist conversational interface.
// Design: ultra-minimal glassmorphism, executive VICMARG aesthetic.
// No chatbot energy. Silent authority. Functional brevity.

import { useEffect, useRef }        from 'react'
import { useAIStore }                from '@store/ai.store'
import { usePerformanceStore }       from '@store/performance.store'
import { VoiceVisualizer }           from './VoiceVisualizer'
import { ConversationControls }      from './ConversationControls'
import type { OverlayInstance }      from '@types-app'

interface Props {
  overlay:   OverlayInstance
  onDismiss: () => void
}

const STATE_LABEL: Record<string, string> = {
  idle:         '',
  initializing: 'Conectando...',
  ready:        'Escuchando',
  listening:    'Escuchando',
  thinking:     'Procesando',
  speaking:     'Respondiendo',
  error:        'Error de conexión',
  ended:        '',
}

export function AIReceptionistOverlay({ overlay, onDismiss }: Props) {
  const conversationState = useAIStore((s) => s.conversationState)
  const transcript        = useAIStore((s) => s.transcript)
  const isEnabled         = useAIStore((s) => s.isEnabled)
  const error             = useAIStore((s) => s.error)
  const threeJSEnabled    = usePerformanceStore((s) => s.threeJSEnabled)

  const transcriptRef = useRef<HTMLDivElement>(null)

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  // If AI not enabled, show minimal fallback — this should not render normally
  if (!isEnabled) return null

  const statusLabel = STATE_LABEL[conversationState] ?? ''
  const lastEntries  = transcript.slice(-4)

  return (
    <div
      style={{
        position:            'relative',
        width:               '400px',
        maxWidth:            'calc(100vw - 2rem)',
        borderRadius:        '16px',
        overflow:            'hidden',
        background:          'rgba(8,10,22,0.88)',
        border:              '1px solid rgba(59,130,246,0.15)',
        backdropFilter:      'blur(24px)',
        WebkitBackdropFilter:'blur(24px)',
        boxShadow:           '0 0 0 1px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top cobalt accent line */}
      <div style={{
        height:     '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.5) 40%, rgba(96,165,250,0.3) 70%, transparent 100%)',
      }} />

      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '16px 20px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status dot */}
          <div style={{
            width:        '6px',
            height:       '6px',
            borderRadius: '50%',
            background:   conversationState === 'error'
              ? 'rgba(248,113,113,0.8)'
              : conversationState === 'ready' || conversationState === 'listening'
                ? 'rgba(74,222,128,0.8)'
                : 'rgba(96,165,250,0.6)',
            boxShadow:    '0 0 6px currentColor',
          }} />
          <span style={{
            fontFamily:    'var(--font-mono, ui-monospace)',
            fontSize:      '9px',
            letterSpacing: '0.14em',
            color:         'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
          }}>
            VICMARG
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {statusLabel && (
            <span style={{
              fontFamily:    'var(--font-mono, ui-monospace)',
              fontSize:      '9px',
              letterSpacing: '0.10em',
              color:         'rgba(96,165,250,0.55)',
              textTransform: 'uppercase',
            }}>
              {statusLabel}
            </span>
          )}
          <ConversationControls />
        </div>
      </div>

      {/* Visualizer + main area */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        padding:        '8px 20px 16px',
        gap:            '16px',
      }}>
        <VoiceVisualizer />

        {/* Transcript */}
        {lastEntries.length > 0 && (
          <div
            ref={transcriptRef}
            style={{
              width:     '100%',
              maxHeight: '140px',
              overflowY: 'auto',
              display:   'flex',
              flexDirection: 'column',
              gap:       '6px',
            }}
          >
            {lastEntries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding:      '8px 12px',
                  borderRadius: '8px',
                  background:   entry.role === 'assistant'
                    ? 'rgba(29,78,216,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border:       entry.role === 'assistant'
                    ? '1px solid rgba(59,130,246,0.12)'
                    : '1px solid rgba(255,255,255,0.05)',
                  alignSelf:    entry.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth:     '85%',
                }}
              >
                <p style={{
                  margin:      0,
                  fontFamily:  'var(--font-display, system-ui)',
                  fontSize:    '13px',
                  lineHeight:  '1.45',
                  fontWeight:  300,
                  color:       entry.role === 'assistant'
                    ? 'rgba(255,255,255,0.78)'
                    : 'rgba(255,255,255,0.45)',
                  letterSpacing: '0.01em',
                }}>
                  {entry.text}
                  {!entry.final && (
                    <span style={{ opacity: 0.4 }}> ▌</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Initial prompt when ready */}
        {conversationState === 'ready' && transcript.length === 0 && (
          <p style={{
            fontFamily:    'var(--font-display, system-ui)',
            fontSize:      '13px',
            fontWeight:    300,
            color:         'rgba(255,255,255,0.30)',
            letterSpacing: '0.02em',
            textAlign:     'center',
            margin:        0,
            lineHeight:    '1.5',
          }}>
            Puede hablar cuando esté listo
          </p>
        )}

        {/* Error state */}
        {conversationState === 'error' && error && (
          <p style={{
            fontFamily:    'var(--font-mono, ui-monospace)',
            fontSize:      '11px',
            color:         'rgba(248,113,113,0.6)',
            textAlign:     'center',
            margin:        0,
          }}>
            {error}
          </p>
        )}

        {/* Initializing */}
        {conversationState === 'initializing' && (
          <p style={{
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize:   '10px',
            color:      'rgba(96,165,250,0.4)',
            textAlign:  'center',
            margin:     0,
            letterSpacing: '0.08em',
          }}>
            Estableciendo conexión segura
          </p>
        )}
      </div>

      {/* Dismiss — only when ended or error */}
      {(conversationState === 'ended' || conversationState === 'error') && overlay.dismissible && (
        <div style={{ padding: '0 20px 16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onDismiss}
            style={{
              background:    'none',
              border:        '1px solid rgba(255,255,255,0.08)',
              color:         'rgba(255,255,255,0.35)',
              borderRadius:  '6px',
              padding:       '6px 16px',
              fontSize:      '11px',
              fontFamily:    'var(--font-mono, ui-monospace)',
              letterSpacing: '0.08em',
              cursor:        'pointer',
            }}
          >
            CERRAR
          </button>
        </div>
      )}
    </div>
  )
}
