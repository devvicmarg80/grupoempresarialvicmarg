// GPUMonitor — one-time WebGL probe at startup.
// Writes GPU capabilities to monitor.store. Decoupled: no EventBus needed.
// WebGL context loss detection is per-canvas (handled by HologramEngine).
// Does NOT create a persistent context — probe canvas is disposed immediately.

import { useMonitorStore } from '@store/monitor.store'
import { eventBus }        from '@lib/event-bus'

class GPUMonitorClass {
  private probed      = false
  private initialized = false

  init(): void {
    if (this.initialized || typeof window === 'undefined') return
    this.probe()
    this.initialized = true
  }

  destroy(): void {
    this.initialized = false
  }

  get isProbed(): boolean { return this.probed }

  // ─── Private ──────────────────────────────────────────────────────────────

  private probe(): void {
    const canvas = document.createElement('canvas')
    const gl = (
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl')  ??
      canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    )

    if (!gl) {
      useMonitorStore.getState().setGPUInfo({
        vendor: 'unavailable', renderer: 'unavailable',
        webgl2: false, maxTextureSize: 0, textureUnits: 0,
        estimatedVRAMTier: 'LOW',
      })
      eventBus.emit('system:error', { systemName: 'GPUMonitor', error: 'webgl_unavailable' })
      canvas.remove()
      return
    }

    const isWebGL2 = gl instanceof WebGL2RenderingContext

    // WEBGL_debug_renderer_info removed from Chrome 98+ (fingerprinting). May return null.
    const dbgInfo  = gl.getExtension('WEBGL_debug_renderer_info')
    const vendor   = dbgInfo
      ? String(gl.getParameter(dbgInfo.UNMASKED_VENDOR_WEBGL))
      : 'unknown'
    const renderer = dbgInfo
      ? String(gl.getParameter(dbgInfo.UNMASKED_RENDERER_WEBGL))
      : 'unknown'

    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
    const textureUnits   = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) as number

    // VRAM tier estimate: max texture size correlates with GPU capability class.
    // 16384+ → HIGH (discrete GPU), 8192 → MID, <8192 → LOW.
    const estimatedVRAMTier: 'HIGH' | 'MID' | 'LOW' =
      maxTextureSize >= 16384 ? 'HIGH' :
      maxTextureSize >= 8192  ? 'MID'  : 'LOW'

    useMonitorStore.getState().setGPUInfo({
      vendor, renderer, webgl2: isWebGL2,
      maxTextureSize, textureUnits, estimatedVRAMTier,
    })

    // Explicitly lose the probe context to free driver resources immediately.
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    canvas.remove()

    this.probed = true
  }
}

export const GPUMonitor = new GPUMonitorClass()
