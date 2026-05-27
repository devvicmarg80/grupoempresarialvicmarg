// HologramEngine — isolated Three.js runtime for the DISCOVERY scene hologram.
// mount(container) / unmount() — called exclusively by DiscoveryHologram.tsx.
// Lifecycle: mount → buildScene → buildHologram → RAF loop → unmount → dispose ALL.
// Coupling rule: only communicates via EventBus. SceneManager never imports this.
// Tier guard: DiscoveryHologram only renders when threeJSEnabled = true (HIGH tier).

import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Group,
  IcosahedronGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
  Mesh,
  MeshPhysicalMaterial,
  AmbientLight,
  PointLight,
  DirectionalLight,
  Object3D,
  Material,
  type ColorRepresentation,
} from 'three'
import { eventBus }        from '@lib/event-bus'
import { useMonitorStore } from '@store/monitor.store'

class HologramEngineClass {
  private renderer:       WebGLRenderer | null = null
  private scene:          Scene | null = null
  private camera:         PerspectiveCamera | null = null
  private hologram:       Group | null = null
  private rafId:          number | null = null
  private metricsTimer:   ReturnType<typeof setInterval> | null = null
  private container:      HTMLElement | null = null
  private lastFrameTimeMs = 0
  private frameStart      = 0
  private mounted         = false
  private readonly cleanupFns: Array<() => void> = []

  // ─── Public API ───────────────────────────────────────────────────────────

  mount(container: HTMLElement): void {
    if (this.mounted) this.unmount()  // Guard against double-mount

    this.container = container
    this.buildScene(container)
    this.buildHologram()
    this.startRenderLoop()
    this.startMetricsPolling()
    this.subscribeToEvents()

    this.mounted = true
    eventBus.emit('system:ready', { systemName: 'HologramEngine' })
  }

  unmount(): void {
    if (!this.mounted) return

    this.stopRenderLoop()
    this.stopMetricsPolling()
    this.cleanupFns.forEach((fn) => fn())
    this.cleanupFns.length = 0
    this.disposeAll()

    useMonitorStore.getState().setHologramMetrics(null)
    this.mounted = false
    eventBus.emit('system:destroyed', { systemName: 'HologramEngine' })
  }

  get isActive(): boolean { return this.mounted }

  // ─── Scene construction ────────────────────────────────────────────────────

  private buildScene(container: HTMLElement): void {
    const w = container.clientWidth  || 420
    const h = container.clientHeight || 420

    // Renderer — transparent background (video layer shows through)
    this.renderer = new WebGLRenderer({
      antialias:       true,
      alpha:           true,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)
    container.appendChild(this.renderer.domElement)

    // WebGL context loss / restore — emits EventBus error then re-attaches loop
    const canvas = this.renderer.domElement
    const onContextLost = (e: Event): void => {
      e.preventDefault()
      this.stopRenderLoop()
      eventBus.emit('system:error', { systemName: 'HologramEngine', error: 'webgl_context_lost' })
    }
    const onContextRestored = (): void => {
      this.startRenderLoop()
    }
    canvas.addEventListener('webglcontextlost',     onContextLost,     false)
    canvas.addEventListener('webglcontextrestored', onContextRestored, false)
    this.cleanupFns.push(
      () => canvas.removeEventListener('webglcontextlost',     onContextLost),
      () => canvas.removeEventListener('webglcontextrestored', onContextRestored),
    )

    // Scene + camera
    this.scene  = new Scene()
    this.camera = new PerspectiveCamera(55, w / h, 0.1, 50)
    this.camera.position.set(0, 0, 4.5)

    // Minimal lighting — no complex HDRI
    const ambient = new AmbientLight(0x1e3a8a as ColorRepresentation, 0.6)
    const point   = new PointLight(0x3b82f6 as ColorRepresentation, 2.5, 12)
    const dir     = new DirectionalLight(0xdbeafe as ColorRepresentation, 0.4)
    point.position.set(3, 3, 2)
    dir.position.set(-2, 3, 3)
    this.scene.add(ambient, point, dir)

    // Resize handler
    const onResize = (): void => {
      if (!this.renderer || !this.camera) return
      const nw = container.clientWidth
      const nh = container.clientHeight
      if (nw === 0 || nh === 0) return
      this.renderer.setSize(nw, nh)
      this.camera.aspect = nw / nh
      this.camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize, { passive: true })
    this.cleanupFns.push(() => window.removeEventListener('resize', onResize))
  }

  private buildHologram(): void {
    if (!this.scene) return

    this.hologram = new Group()

    // Solid icosahedron — cobalt with physical material
    const geo = new IcosahedronGeometry(1.2, 2)
    const mat = new MeshPhysicalMaterial({
      color:             0x1e40af as ColorRepresentation,
      emissive:          0x1e3a8a as ColorRepresentation,
      emissiveIntensity: 0.55,
      metalness:         0.75,
      roughness:         0.15,
      transparent:       true,
      opacity:           0.72,
    })
    const mesh = new Mesh(geo, mat)
    this.hologram.add(mesh)

    // Wireframe overlay — cobalt-light, barely-there lines
    const wGeo = new WireframeGeometry(geo)
    const wMat = new LineBasicMaterial({
      color:       0x60a5fa as ColorRepresentation,
      opacity:     0.28,
      transparent: true,
    })
    const wire = new LineSegments(wGeo, wMat)
    wire.scale.setScalar(1.008)  // Avoids z-fighting with the solid mesh
    this.hologram.add(wire)

    this.scene.add(this.hologram)
  }

  // ─── Render loop ──────────────────────────────────────────────────────────

  private startRenderLoop(): void {
    this.frameStart = performance.now()

    const loop = (ts: number): void => {
      this.rafId = requestAnimationFrame(loop)

      this.lastFrameTimeMs = ts - this.frameStart
      this.frameStart      = ts

      this.animateHologram(ts)

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera)
      }
    }

    this.rafId = requestAnimationFrame(loop)
  }

  private stopRenderLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  private animateHologram(ts: number): void {
    if (!this.hologram) return
    const t = ts * 0.001  // seconds

    this.hologram.rotation.y = t * 0.28
    this.hologram.rotation.x = Math.sin(t * 0.18) * 0.14
    this.hologram.position.y = Math.sin(t * 0.65) * 0.09
  }

  // ─── Metrics polling ──────────────────────────────────────────────────────
  // Updates monitor.store every 2s — not every frame — to avoid excessive renders

  private startMetricsPolling(): void {
    this.metricsTimer = setInterval(() => {
      if (!this.renderer) return
      const mem = this.renderer.info.memory
      useMonitorStore.getState().setHologramMetrics({
        frameTimeMs: Math.round(this.lastFrameTimeMs * 10) / 10,
        geometries:  mem.geometries,
        textures:    mem.textures,
        programs:    this.renderer.info.programs?.length ?? 0,
      })
    }, 2000)
  }

  private stopMetricsPolling(): void {
    if (this.metricsTimer !== null) {
      clearInterval(this.metricsTimer)
      this.metricsTimer = null
    }
  }

  // ─── EventBus subscriptions ────────────────────────────────────────────────

  private subscribeToEvents(): void {
    // Auto-disable immediately on FPS collapse — don't wait for React unmount cycle
    const unsubFPS = eventBus.on('performance:fps:drop', ({ fps }) => {
      if (fps < 35 && this.mounted) {
        this.stopRenderLoop()
        eventBus.emit('system:error', {
          systemName: 'HologramEngine',
          error:      `fps_collapse_auto_disabled:${fps}fps`,
        })
      }
    })
    this.cleanupFns.push(unsubFPS)
  }

  // ─── Strict Three.js dispose ──────────────────────────────────────────────
  // Order: stop loop → traverse+dispose → renderer.dispose() → null refs
  // Renderer.dispose() releases WebGL shader programs and framebuffers.

  private disposeAll(): void {
    this.scene?.traverse((object: Object3D) => {
      if (object instanceof Mesh || object instanceof LineSegments) {
        object.geometry.dispose()
        const mat = object.material as Material | Material[]
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose())
        } else {
          mat.dispose()
        }
      }
    })

    if (this.renderer) {
      // Remove canvas from container before dispose
      const canvas = this.renderer.domElement
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)

      this.renderer.dispose()
    }

    this.renderer  = null
    this.scene     = null
    this.camera    = null
    this.hologram  = null
    this.container = null
  }
}

export const HologramEngine = new HologramEngineClass()
