// ─── VICMARG Animation Configuration ────────────────────────────────────────
// GSAP global defaults and per-system animation contracts.
// This file feeds GSAPRegistry.ts and EasingLibrary.ts.
// ───────────────────────────────────────────────────────────────────────────

import { Animation } from './design-tokens'

// ─── GSAP Global Defaults ─────────────────────────────────────────────────
// Set once in GSAPRegistry.ts via gsap.defaults()
export const GSAP_DEFAULTS = {
  ease:       Animation.ease.entry,
  duration:   Animation.duration.cinematic,
  overwrite:  'auto' as const, // Prevents conflicting tweens
} as const

// ─── Named Easings ─────────────────────────────────────────────────────────
// Used throughout all GSAP calls — never use raw GSAP ease strings
export const EASINGS = {
  entry:     Animation.ease.entry,      // power2.out
  exit:      Animation.ease.exit,       // power2.in
  cinematic: Animation.ease.cinematic,  // power4.inOut
  organic:   Animation.ease.organic,    // elastic.out(1, 0.5)
  scroll:    Animation.ease.scroll,     // none (scrub)
  text:      Animation.ease.text,       // power1.out
  premium:   'expo.out',                // Exponential for premium CTAs
  snap:      'back.out(1.2)',           // Snap-feel for interactive elements
} as const

// ─── ScrollTrigger Defaults ────────────────────────────────────────────────
export const SCROLL_DEFAULTS = {
  scrub:         1,      // 1 second lag — smooth cinematic scroll
  anticipatePin: 1,      // Prevents scroll-jump on pin
  invalidateOnRefresh: true, // Recalculates on resize
} as const

// ─── Overlay Animation Specs ──────────────────────────────────────────────
export const OVERLAY_ANIMATION = {
  enter: {
    duration:  Animation.duration.standard,  // 0.6s
    ease:      EASINGS.entry,
    autoAlpha: 0,                            // opacity: 0 + visibility: hidden
    y:         24,                           // Slides up 24px
    blur:      '12px',                       // Starts blurred
  },
  exit: {
    duration:  Animation.duration.fast,      // 0.3s
    ease:      EASINGS.exit,
    autoAlpha: 0,
    y:         -12,
    blur:      '0px',
  },
} as const

// ─── Scene Transition Specs ────────────────────────────────────────────────
export const TRANSITION_ANIMATION = {
  crossfade: {
    duration:  0.8,           // 800ms — zero black frames guaranteed
    ease:      EASINGS.cinematic,
    overlap:   0.4,           // Both videos visible for 400ms during cross
  },
} as const

// ─── Text Reveal Specs ────────────────────────────────────────────────────
export const TEXT_REVEAL = {
  stagger:   0.04,            // 40ms between characters
  duration:  Animation.duration.fast,
  ease:      EASINGS.text,
  y:         20,
  autoAlpha: 0,
} as const

// ─── Microinteraction Specs ───────────────────────────────────────────────
export const MICROINTERACTION = {
  hover: {
    scale:    1.02,
    duration: Animation.duration.micro,
    ease:     EASINGS.organic,
  },
  tap: {
    scale:    0.97,
    duration: 0.08,
    ease:     EASINGS.exit,
  },
  glow: {
    duration: 0.4,
    ease:     EASINGS.entry,
  },
} as const
