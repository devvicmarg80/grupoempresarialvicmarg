'use client'

import { useState }               from 'react'
import { useMonitorStore }         from '@store/monitor.store'
import { useSceneStore }           from '@store/scene.store'
import { usePerformanceStore }     from '@store/performance.store'
import { SCENE_SEQUENCE }          from '@config/scenes.config'

const TIER_COLOR: Record<string, string> = {
  HIGH: '#4ade80',
  MID:  '#facc15',
  LOW:  '#f87171',
}

const IS_DEV = process.env.NODE_ENV === 'development'

// Video state → display color class
const STATE_COLOR: Record<string, string> = {
  playing:    '#4ade80',  // green
  preloaded:  '#60a5fa',  // blue
  preloading: '#facc15',  // yellow
  loading:    '#facc15',
  buffering:  '#facc15',
  paused:     '#6b7280',  // gray
  error:      '#f87171',  // red
}

export function DevRuntimePanel() {
  const [collapsed, setCollapsed] = useState(false)

  const timelineCount      = useMonitorStore((s) => s.timelineCount)
  const stCount            = useMonitorStore((s) => s.scrollTriggerCount)
  const transitions        = useMonitorStore((s) => s.recentTransitions)
  const videoStates        = useMonitorStore((s) => s.videoStates)
  const activeOverlayIds   = useMonitorStore((s) => s.activeOverlayIds)
  const recentFPSDrops     = useMonitorStore((s) => s.recentFPSDrops)
  const gpuInfo            = useMonitorStore((s) => s.gpuInfo)
  const hologramMetrics    = useMonitorStore((s) => s.hologramMetrics)
  const memoryUsageMB      = useMonitorStore((s) => s.memoryUsageMB)
  const droppedFrames      = useMonitorStore((s) => s.droppedFrames)
  const lastLatencyMs      = useMonitorStore((s) => s.lastTransitionLatencyMs)

  const currentScene   = useSceneStore((s) => s.currentScene)
  const sceneProgress  = useSceneStore((s) => s.sceneProgress)
  const isLocked       = useSceneStore((s) => s.isLocked)

  const currentFPS     = usePerformanceStore((s) => s.currentFPS)
  const deviceTier     = usePerformanceStore((s) => s.deviceTier)
  const isDetected     = usePerformanceStore((s) => s.isDetected)

  if (!IS_DEV) return null

  const barWidth = `${Math.round(sceneProgress * 100)}%`
  const fpsColor = currentFPS >= 50 ? '#4ade80' : currentFPS >= 35 ? '#facc15' : '#f87171'

  const BASE = {
    fontFamily: 'var(--font-mono, ui-monospace)',
    fontSize:   '10px',
    lineHeight: '1.4',
  }
  const PANEL: React.CSSProperties = {
    ...BASE,
    position:       'fixed',
    top:            '1rem',
    right:          '1rem',
    zIndex:         9999,
    background:     'rgba(6,6,14,0.88)',
    border:         '1px solid rgba(96,165,250,0.2)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius:   '10px',
    color:          'rgba(255,255,255,0.55)',
    width:          collapsed ? 'auto' : '220px',
    overflow:       'hidden',
    pointerEvents:  'auto',
  }

  return (
    <div style={PANEL} className="select-none">
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        style={{ borderBottom: collapsed ? 'none' : '1px solid rgba(96,165,250,0.1)' }}
        onClick={() => { setCollapsed((c) => !c) }}
        role="button"
        aria-expanded={!collapsed}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setCollapsed((c) => !c) }}
      >
        <span style={{ color: 'rgba(96,165,250,0.7)', letterSpacing: '0.08em' }}>
          RUNTIME
        </span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{collapsed ? '＋' : '－'}</span>
      </div>

      {!collapsed && (
        <div className="px-3 py-2 space-y-2.5">
          {/* Header row */}
          <div className="flex items-center gap-3">
            <span>CTX <span style={{ color: '#60a5fa' }}>{timelineCount}</span></span>
            <span>ST <span style={{ color: '#60a5fa' }}>{stCount}</span></span>
            <span>
              FPS <span style={{ color: fpsColor }}>{currentFPS}</span>
            </span>
            <span style={{ color: isDetected ? '#4ade80' : '#facc15', fontSize: '9px' }}>
              {deviceTier}
            </span>
          </div>

          {/* Scene progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span>
                <span style={{ color: '#e2e8f0' }}>{currentScene}</span>
                {isLocked && <span style={{ color: '#f87171' }}> ⊘</span>}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{Math.round(sceneProgress * 100)}%</span>
            </div>
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
              <div style={{ width: barWidth, height: '100%', background: '#3b82f6', borderRadius: '2px', transition: 'width 0.1s linear' }} />
            </div>
          </div>

          {/* Video states */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '4px' }}>VIDEO</p>
            {SCENE_SEQUENCE.map((sceneId) => {
              const state = (videoStates as Record<string, string | undefined>)[sceneId] ?? 'idle'
              const color = (STATE_COLOR as Record<string, string | undefined>)[state] ?? '#6b7280'
              return (
                <div key={sceneId} className="flex items-center justify-between">
                  <span>{sceneId.slice(0, 8)}</span>
                  <span style={{ color }}>{state}</span>
                </div>
              )
            })}
          </div>

          {/* Recent transitions */}
          {transitions.length > 0 && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                TRANSITIONS
              </p>
              {transitions.slice(-3).map((t, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {t.from.slice(0, 4)}→{t.to.slice(0, 4)}
                  </span>
                  <span style={{ color: t.durationMs !== null ? '#4ade80' : '#facc15' }}>
                    {t.durationMs !== null ? `${t.durationMs}ms` : '…'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Active overlays */}
          {activeOverlayIds.length > 0 && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '4px' }}>
                OVERLAYS
              </p>
              {activeOverlayIds.map((id) => (
                <div key={id} style={{ color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {id}
                </div>
              ))}
            </div>
          )}

          {/* FPS drops */}
          {recentFPSDrops.length > 0 && (
            <div>
              <p style={{ color: '#f87171', letterSpacing: '0.1em', marginBottom: '4px' }}>FPS DROPS</p>
              {recentFPSDrops.slice(-2).map((d, i) => (
                <div key={i} style={{ color: '#f87171' }}>
                  {d.fps}fps (threshold {d.threshold})
                </div>
              ))}
            </div>
          )}

          {/* GPU info */}
          {gpuInfo && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '4px' }}>GPU</p>
              <div className="flex items-center justify-between">
                <span>VRAM tier</span>
                <span style={{ color: (TIER_COLOR as Record<string, string | undefined>)[gpuInfo.estimatedVRAMTier] ?? '#6b7280' }}>
                  {gpuInfo.estimatedVRAMTier}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>texSize</span>
                <span style={{ color: '#60a5fa' }}>{gpuInfo.maxTextureSize}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>WebGL2</span>
                <span style={{ color: gpuInfo.webgl2 ? '#4ade80' : '#f87171' }}>
                  {gpuInfo.webgl2 ? 'yes' : 'no'}
                </span>
              </div>
              {gpuInfo.vendor !== 'unknown' && gpuInfo.vendor !== 'unavailable' && (
                <div style={{ color: 'rgba(255,255,255,0.25)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {gpuInfo.vendor.slice(0, 28)}
                </div>
              )}
            </div>
          )}

          {/* Hologram metrics */}
          {hologramMetrics && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '4px' }}>HOLOGRAM</p>
              <div className="flex items-center justify-between">
                <span>frame</span>
                <span style={{ color: hologramMetrics.frameTimeMs < 20 ? '#4ade80' : hologramMetrics.frameTimeMs < 33 ? '#facc15' : '#f87171' }}>
                  {hologramMetrics.frameTimeMs}ms
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>geo / tex</span>
                <span style={{ color: '#60a5fa' }}>
                  {hologramMetrics.geometries} / {hologramMetrics.textures}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>programs</span>
                <span style={{ color: '#60a5fa' }}>{hologramMetrics.programs}</span>
              </div>
            </div>
          )}

          {/* Memory + dropped frames */}
          <div>
            <p style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', marginBottom: '4px' }}>STABILITY</p>
            {memoryUsageMB !== null && (
              <div className="flex items-center justify-between">
                <span>JS heap</span>
                <span style={{ color: memoryUsageMB > 300 ? '#f87171' : memoryUsageMB > 150 ? '#facc15' : '#4ade80' }}>
                  {memoryUsageMB}MB
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>dropped</span>
              <span style={{ color: droppedFrames > 20 ? '#f87171' : droppedFrames > 5 ? '#facc15' : '#6b7280' }}>
                {droppedFrames}
              </span>
            </div>
            {lastLatencyMs !== null && (
              <div className="flex items-center justify-between">
                <span>t-latency</span>
                <span style={{ color: lastLatencyMs > 1200 ? '#f87171' : lastLatencyMs > 950 ? '#facc15' : '#4ade80' }}>
                  {lastLatencyMs}ms
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
