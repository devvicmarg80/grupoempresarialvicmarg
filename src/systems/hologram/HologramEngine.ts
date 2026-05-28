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
  PointLight,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  Material,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
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

  // Per-frame animated objects
  private coreMat:      MeshPhysicalMaterial | null = null
  private innerCore:    Mesh | null = null
  private innerCoreMat: MeshPhysicalMaterial | null = null
  private outerCage:    LineSegments | null = null
  private particles:    Points | null = null

  // Lerp-smoothed rotation — organic cinematic inertia
  private rotY = 0
  private rotX = 0

  private readonly cleanupFns: Array<() => void> = []

  // ─── Public API ───────────────────────────────────────────────────────────

  mount(container: HTMLElement): void {
    if (this.mounted) this.unmount()  // Guard against double-mount

    this.container = container
    this.rotY = 0
    this.rotX = 0
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

    // Scene + camera — slight upward offset for better hologram framing
    this.scene  = new Scene()
    this.camera = new PerspectiveCamera(52, w / h, 0.1, 50)
    this.camera.position.set(0, 0.25, 5.2)

    // Cinematic 4-light rig: hemisphere + key + fill + rim
    const hemi  = new HemisphereLight(0x1e40af as ColorRepresentation, 0x050510 as ColorRepresentation, 0.55)
    const key   = new PointLight(0x3b82f6 as ColorRepresentation, 3.2, 14)
    const fill  = new PointLight(0x60a5fa as ColorRepresentation, 1.4, 10)
    const rim   = new DirectionalLight(0xdbeafe as ColorRepresentation, 0.45)
    key.position.set( 3,    3,  2)
    fill.position.set(-2.5, -1, 3)
    rim.position.set( -2,   4,  3)
    this.scene.add(hemi, key, fill, rim)

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

    // Core icosahedron — cobalt, high-detail mesh
    const coreGeo  = new IcosahedronGeometry(1.0, 3)
    this.coreMat   = new MeshPhysicalMaterial({
      color:             0x1a3a9a as ColorRepresentation,
      emissive:          0x1e3a8a as ColorRepresentation,
      emissiveIntensity: 0.55,
      metalness:         0.82,
      roughness:         0.10,
      transparent:       true,
      opacity:           0.66,
    })
    this.hologram.add(new Mesh(coreGeo, this.coreMat))

    // Inner glowing core — brighter emissive, counter-rotates
    const innerGeo    = new IcosahedronGeometry(0.50, 2)
    this.innerCoreMat = new MeshPhysicalMaterial({
      color:             0x2563eb as ColorRepresentation,
      emissive:          0x60a5fa as ColorRepresentation,
      emissiveIntensity: 1.25,
      metalness:         0.5,
      roughness:         0.05,
      transparent:       true,
      opacity:           0.38,
    })
    this.innerCore = new Mesh(innerGeo, this.innerCoreMat)
    this.hologram.add(this.innerCore)

    // Primary wireframe lattice — tight cobalt lines
    const wGeo = new WireframeGeometry(coreGeo)
    const wMat = new LineBasicMaterial({
      color:       0x60a5fa as ColorRepresentation,
      opacity:     0.22,
      transparent: true,
    })
    const wire = new LineSegments(wGeo, wMat)
    wire.scale.setScalar(1.005)
    this.hologram.add(wire)

    // Outer sparse cage — slower counter-rotation adds depth perception
    const outerGeo  = new WireframeGeometry(new IcosahedronGeometry(1.72, 1))
    const outerMat  = new LineBasicMaterial({
      color:       0x3b82f6 as ColorRepresentation,
      opacity:     0.09,
      transparent: true,
    })
    this.outerCage = new LineSegments(outerGeo, outerMat)
    this.hologram.add(this.outerCage)

    // Floating particle cloud
    this.buildParticles()

    this.scene.add(this.hologram)
  }

  private buildParticles(): void {
    const count     = 60
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 1.55 + Math.random() * 0.80
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    const mat = new PointsMaterial({
      color:           0x93c5fd as ColorRepresentation,
      size:            0.022,
      transparent:     true,
      opacity:         0.48,
      sizeAttenuation: true,
    })
    this.particles = new Points(geo, mat)
    this.hologram?.add(this.particles)
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
    const t = ts * 0.001

    // Lerp rotation towards target — organic cinematic inertia
    const tRotY = t * 0.22
    const tRotX = Math.sin(t * 0.14) * 0.12
    this.rotY  += (tRotY - this.rotY) * 0.06
    this.rotX  += (tRotX - this.rotX) * 0.04

    this.hologram.rotation.y = this.rotY
    this.hologram.rotation.x = this.rotX
    this.hologram.position.y = Math.sin(t * 0.52) * 0.09
    this.hologram.scale.setScalar(1 + Math.sin(t * 0.65) * 0.018)

    if (this.outerCage) {
      this.outerCage.rotation.y = -t * 0.11
      this.outerCage.rotation.z =  t * 0.055
    }

    if (this.innerCore) {
      this.innerCore.rotation.y = -t * 0.48
      this.innerCore.rotation.z =  Math.sin(t * 0.22) * 0.18
    }

    if (this.coreMat) {
      this.coreMat.emissiveIntensity = 0.48 + Math.sin(t * 1.08) * 0.18
    }

    if (this.innerCoreMat) {
      this.innerCoreMat.emissiveIntensity = 1.05 + Math.sin(t * 1.72) * 0.35
      this.innerCoreMat.opacity           = 0.36 + Math.sin(t * 0.88) * 0.08
    }

    if (this.particles) {
      this.particles.rotation.y = t * 0.055
      this.particles.rotation.x = Math.sin(t * 0.07) * 0.04
    }
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
      if (object instanceof Mesh || object instanceof LineSegments || object instanceof Points) {
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

    this.renderer     = null
    this.scene        = null
    this.camera       = null
    this.hologram     = null
    this.coreMat      = null
    this.innerCore    = null
    this.innerCoreMat = null
    this.outerCage    = null
    this.particles    = null
    this.container    = null
  }
}

export const HologramEngine = new HologramEngineClass()
