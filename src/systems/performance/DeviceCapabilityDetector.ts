// ─── DeviceCapabilityDetector ────────────────────────────────────────────────
// Runs ONCE at platform startup — before any other system mounts.
// Detects GPU tier, RAM, CPU, network, and iOS/Safari specifics.
// Writes to performanceStore and emits 'performance:detection:complete'.
// ───────────────────────────────────────────────────────────────────────────

import { eventBus } from '@lib/event-bus'
import { usePerformanceStore } from '@store/performance.store'
import { DETECTION_THRESHOLDS } from '@config/performance.config'
import type { DeviceCapabilities, DeviceTier, ConnectionType } from '@types-app'

class DeviceCapabilityDetector {
  private detected = false

  /**
   * Main detection entry point.
   * Call once in PerformanceProvider on client mount.
   */
  async detect(): Promise<DeviceCapabilities> {
    if (this.detected) {
      const { capabilities } = usePerformanceStore.getState()
      if (capabilities) return capabilities
    }

    const capabilities = await this.gatherCapabilities()
    this.detected = true

    // Write to store
    usePerformanceStore.getState().setCapabilities(capabilities)

    // Emit for other systems to react
    eventBus.emit('performance:detection:complete', { tier: capabilities.tier })
    eventBus.emit('performance:connection', {
      type: capabilities.connectionType,
      downlinkMbps: capabilities.downlinkMbps,
    })

    if (process.env.NODE_ENV === 'development') {
      console.info('[DeviceCapabilityDetector]', capabilities)
    }

    return capabilities
  }

  private async gatherCapabilities(): Promise<DeviceCapabilities> {
    const isIOS    = this.detectIOS()
    const isSafari = this.detectSafari()
    const isMobile = this.detectMobile()
    const isTouch  = this.detectTouch()

    const cpuCores   = navigator.hardwareConcurrency ?? 2
    const ramGB      = this.getRAM()
    const dpr        = window.devicePixelRatio ?? 1
    const connection = this.getConnectionInfo()
    const gpuTier    = await this.detectGPUTier()

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // WebGL / WebGL2 support
    const supportsWebGL  = this.testWebGL(1)
    const supportsWebGL2 = this.testWebGL(2)

    // WebRTC (for future OpenAI Realtime)
    const supportsWebRTC = typeof RTCPeerConnection !== 'undefined'

    // AudioContext (for future ElevenLabs)
    const supportsAudioContext = typeof AudioContext !== 'undefined'
      || typeof (window as Window & { webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined'

    // HLS support
    const supportsHLS = this.testHLSSupport(isIOS, isSafari)

    const tier = this.classifyTier({
      ramGB, cpuCores, gpuTier, downlinkMbps: connection.downlinkMbps,
    })

    return {
      tier,
      gpuTier:               gpuTier as 0 | 1 | 2 | 3,
      ramGB,
      cpuCores,
      connectionType:        connection.type,
      downlinkMbps:          connection.downlinkMbps,
      supportsHLS,
      supportsWebGL,
      supportsWebGL2,
      supportsWebRTC,
      supportsAudioContext,
      prefersReducedMotion,
      devicePixelRatio:      dpr,
      isIOS,
      isSafari,
      isMobile,
      isTouch,
      screenWidth:           window.screen.width,
      screenHeight:          window.screen.height,
    }
  }

  private classifyTier(params: {
    ramGB: number | null
    cpuCores: number
    gpuTier: number
    downlinkMbps: number | null
  }): DeviceTier {
    const { ramGB, cpuCores, gpuTier, downlinkMbps } = params
    const h = DETECTION_THRESHOLDS.HIGH
    const m = DETECTION_THRESHOLDS.MID

    const meetsHIGH =
      (ramGB === null || ramGB >= h.minRAM) &&
      cpuCores >= h.minCPUCores &&
      gpuTier >= h.minGPUTier &&
      (downlinkMbps === null || downlinkMbps >= h.minDownlink)

    if (meetsHIGH) return 'HIGH'

    const meetsMID =
      (ramGB === null || ramGB >= m.minRAM) &&
      cpuCores >= m.minCPUCores &&
      gpuTier >= m.minGPUTier &&
      (downlinkMbps === null || downlinkMbps >= m.minDownlink)

    return meetsMID ? 'MID' : 'LOW'
  }

  private async detectGPUTier(): Promise<number> {
    try {
      const canvas  = document.createElement('canvas')
      const gl      = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      if (!gl) return 0

      const ext      = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
      if (!ext) return 1

      const renderer = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL) as string
      canvas.remove()

      // Classify by renderer string
      if (/nvidia|amd|radeon|geforce/i.test(renderer)) return 3 // Discrete
      if (/apple m\d|apple gpu/i.test(renderer)) return 3       // Apple Silicon
      if (/intel|iris|uhd/i.test(renderer)) return 2            // Integrated
      if (/mali|adreno|powervr/i.test(renderer)) return 1       // Mobile GPU

      return 1
    } catch {
      return 1
    }
  }

  private testWebGL(version: 1 | 2): boolean {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext(version === 2 ? 'webgl2' : 'webgl')
      const supported = ctx !== null
      canvas.remove()
      return supported
    } catch {
      return false
    }
  }

  private testHLSSupport(isIOS: boolean, isSafari: boolean): boolean {
    // Safari on iOS/macOS supports HLS natively
    if (isIOS || isSafari) return true
    // Check for MediaSource Extensions (required for HLS.js)
    return typeof MediaSource !== 'undefined'
  }

  private getRAM(): number | null {
    // navigator.deviceMemory is non-standard but widely supported
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    return memory ?? null
  }

  private getConnectionInfo(): { type: ConnectionType; downlinkMbps: number | null } {
    const conn = (navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number }
    }).connection

    if (!conn) return { type: 'unknown', downlinkMbps: null }

    const typeMap: Record<string, ConnectionType> = {
      '4g': '4g', '3g': '3g', '2g': '2g', 'slow-2g': 'slow-2g',
    }

    return {
      type:         typeMap[conn.effectiveType ?? ''] ?? 'unknown',
      downlinkMbps: conn.downlink ?? null,
    }
  }

  private detectIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }

  private detectSafari(): boolean {
    return /Safari/.test(navigator.userAgent) &&
      !/Chrome|Chromium/.test(navigator.userAgent)
  }

  private detectMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent) || window.innerWidth < 768
  }

  private detectTouch(): boolean {
    return navigator.maxTouchPoints > 0
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────
export const deviceCapabilityDetector = new DeviceCapabilityDetector()
