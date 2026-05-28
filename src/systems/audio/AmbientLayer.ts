// AmbientLayer — per-scene programmatic ambient drone synthesis.
// No external audio files. Pure Web Audio API oscillator clusters.
// Called exclusively by AudioEngine.
// Each scene has a distinct emotional frequency palette:
//   ARRIVAL    — Bb1 (58Hz): deep, vast, mysterious
//   GREETING   — A2  (110Hz): warm, composed, welcoming
//   DISCOVERY  — D2  (73Hz): electric, open, technological
//   CONVERSION — F2  (87Hz): rich, decisive, aspirational

import type { SceneId } from '@types-app'

interface DroneConfig {
  fundamental: number       // Root frequency Hz
  ratios:      number[]     // Harmonic ratios (1 = fundamental)
  filterFreq:  number       // Lowpass cutoff Hz
  lfoRate:     number       // Pitch LFO rate Hz (very slow)
  lfoDepth:    number       // Pitch LFO depth Hz
  gain:        number       // Scene master gain (0–1)
  detune:      number       // Detuning cents per oscillator (richness)
}

const DRONES: Record<SceneId, DroneConfig> = {
  ARRIVAL: {
    fundamental: 58.27,   // Bb1
    ratios:      [1, 1.5, 2, 2.667],
    filterFreq:  260,
    lfoRate:     0.08,
    lfoDepth:    1.8,
    gain:        0.055,
    detune:      4,
  },
  GREETING: {
    fundamental: 110,     // A2
    ratios:      [1, 1.259, 1.5, 2],
    filterFreq:  440,
    lfoRate:     0.11,
    lfoDepth:    2.5,
    gain:        0.048,
    detune:      3,
  },
  DISCOVERY: {
    fundamental: 73.42,   // D2
    ratios:      [1, 1.5, 2, 3],
    filterFreq:  560,
    lfoRate:     0.07,
    lfoDepth:    3.2,
    gain:        0.062,
    detune:      5,
  },
  CONVERSION: {
    fundamental: 87.31,   // F2
    ratios:      [1, 1.5, 2, 2.5],
    filterFreq:  360,
    lfoRate:     0.09,
    lfoDepth:    2.0,
    gain:        0.068,
    detune:      3.5,
  },
}

const CROSSFADE_TIME = 4.0   // seconds — slow, cinematic
const FADE_IN_TIME   = 5.0   // seconds — breath-in on first scene

interface SceneNodes {
  masterGain:  GainNode
  oscillators: OscillatorNode[]
  lfos:        OscillatorNode[]
  filter:      BiquadFilterNode
  reverb:      ConvolverNode
}

export class AmbientLayer {
  private readonly ctx:  AudioContext
  private readonly dest: GainNode
  private current:       SceneNodes | null = null
  private currentScene:  SceneId | null = null
  private reduced        = false

  constructor(ctx: AudioContext, dest: GainNode) {
    this.ctx  = ctx
    this.dest = dest
  }

  transitionTo(scene: SceneId): void {
    if (scene === this.currentScene) return

    const now  = this.ctx.currentTime
    const prev = this.current

    // Fade out previous scene
    if (prev) {
      prev.masterGain.gain.setValueAtTime(prev.masterGain.gain.value, now)
      prev.masterGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_TIME)
      setTimeout(() => this.disposeNodes(prev), (CROSSFADE_TIME + 0.5) * 1000)
    }

    // Build + fade in new scene
    const next = this.buildDrone(scene)
    const cfg  = DRONES[scene]
    const fadeTime = this.current === null ? FADE_IN_TIME : CROSSFADE_TIME
    next.masterGain.gain.setValueAtTime(0, now)
    next.masterGain.gain.linearRampToValueAtTime(
      this.reduced ? cfg.gain * 0.3 : cfg.gain,
      now + fadeTime
    )

    this.current      = next
    this.currentScene = scene
  }

  reduceComplexity(): void {
    this.reduced = true
    if (!this.current) return
    const cfg = DRONES[this.currentScene!]
    if (!cfg) return
    const now = this.ctx.currentTime
    this.current.masterGain.gain.linearRampToValueAtTime(cfg.gain * 0.25, now + 2.0)
  }

  destroy(): void {
    if (this.current) this.disposeNodes(this.current)
    this.current      = null
    this.currentScene = null
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private buildDrone(scene: SceneId): SceneNodes {
    const cfg = DRONES[scene]
    const now = this.ctx.currentTime

    const masterGain = this.ctx.createGain()
    masterGain.gain.setValueAtTime(0, now)

    // Synthetic reverb (noise impulse — no external files)
    const reverb = this.createReverb(2.0, 1.6)

    // Wet/dry split for reverb
    const dryGain = this.ctx.createGain()
    const wetGain = this.ctx.createGain()
    dryGain.gain.setValueAtTime(0.6, now)
    wetGain.gain.setValueAtTime(0.4, now)

    // Lowpass filter — defines scene character
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(cfg.filterFreq, now)
    filter.Q.setValueAtTime(0.8, now)

    // Route: oscillators → filter → dry/wet → masterGain → dest
    filter.connect(dryGain)
    filter.connect(reverb)
    reverb.connect(wetGain)
    dryGain.connect(masterGain)
    wetGain.connect(masterGain)
    masterGain.connect(this.dest)

    const oscillators: OscillatorNode[] = []
    const lfos:        OscillatorNode[] = []

    cfg.ratios.forEach((ratio, i) => {
      const freq    = cfg.fundamental * ratio
      const detune  = (i % 2 === 0 ? 1 : -1) * cfg.detune

      // Main oscillator
      const osc = this.ctx.createOscillator()
      osc.type = i === 2 ? 'triangle' : 'sine'  // slight overtone on 3rd partial
      osc.frequency.setValueAtTime(freq, now)
      osc.detune.setValueAtTime(detune, now)

      // Per-oscillator gain — lower harmonics louder
      const oscGain = this.ctx.createGain()
      oscGain.gain.setValueAtTime(1 / (i + 1) / cfg.ratios.length, now)

      // LFO — slow pitch modulation
      const lfo      = this.ctx.createOscillator()
      const lfoGain  = this.ctx.createGain()
      lfo.type = 'sine'
      lfo.frequency.setValueAtTime(cfg.lfoRate * (1 + i * 0.07), now)
      lfoGain.gain.setValueAtTime(cfg.lfoDepth * (1 / (i + 1)), now)
      lfo.connect(lfoGain)
      lfoGain.connect(osc.frequency)

      osc.connect(oscGain)
      oscGain.connect(filter)

      osc.start(now)
      lfo.start(now)

      oscillators.push(osc)
      lfos.push(lfo)
    })

    return { masterGain, oscillators, lfos, filter, reverb }
  }

  private createReverb(durationSec: number, decay: number): ConvolverNode {
    const convolver  = this.ctx.createConvolver()
    const sampleRate = this.ctx.sampleRate
    const length     = Math.floor(sampleRate * durationSec)
    const buffer     = this.ctx.createBuffer(2, length, sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay)
      }
    }
    convolver.buffer = buffer
    return convolver
  }

  private disposeNodes(nodes: SceneNodes): void {
    const now = this.ctx.currentTime
    nodes.oscillators.forEach((o) => { try { o.stop(now) } catch { /* already stopped */ } })
    nodes.lfos.forEach((l)        => { try { l.stop(now) } catch { /* already stopped */ } })
    nodes.filter.disconnect()
    nodes.reverb.disconnect()
    nodes.masterGain.disconnect()
  }
}
