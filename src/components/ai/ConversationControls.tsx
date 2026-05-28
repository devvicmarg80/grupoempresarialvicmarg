'use client'

// ConversationControls — minimal mute + end session controls for AI Receptionist.
// Design: ultra-minimal, no labels, icon-only, premium dark.

import { useAIStore }   from '@store/ai.store'
import { eventBus }     from '@lib/event-bus'
import { SessionOrchestrator } from '@systems/ai/SessionOrchestrator'

const BTN: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          '36px',
  height:         '36px',
  borderRadius:   '50%',
  border:         '1px solid rgba(255,255,255,0.08)',
  background:     'rgba(255,255,255,0.04)',
  cursor:         'pointer',
  transition:     'background 0.15s ease, border-color 0.15s ease',
  outline:        'none',
  color:          'rgba(255,255,255,0.45)',
  fontSize:       '14px',
}

export function ConversationControls() {
  const isMuted = useAIStore((s) => s.isMuted)

  const handleMuteToggle = () => {
    const next = !isMuted
    useAIStore.getState().setMuted(next)
    eventBus.emit('audio:muted', { muted: next })
  }

  const handleEnd = () => {
    void SessionOrchestrator.endSession('user_ended')
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Mute / Unmute */}
      <button
        type="button"
        style={{
          ...BTN,
          ...(isMuted ? { borderColor: 'rgba(248,113,113,0.4)', color: 'rgba(248,113,113,0.7)' } : {}),
        }}
        onClick={handleMuteToggle}
        aria-label={isMuted ? 'Activar audio' : 'Silenciar'}
        title={isMuted ? 'Activar audio' : 'Silenciar'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* End session */}
      <button
        type="button"
        style={{
          ...BTN,
          borderColor: 'rgba(248,113,113,0.2)',
          color:       'rgba(248,113,113,0.5)',
        }}
        onClick={handleEnd}
        aria-label="Finalizar conversación"
        title="Finalizar"
      >
        ✕
      </button>
    </div>
  )
}
