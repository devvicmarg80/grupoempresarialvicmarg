// ─── Scene Store ─────────────────────────────────────────────────────────────
// FSM state for the 4 cinematic scenes.
// RULE: Never mutate from components — only SceneManager uses setState.
// RULE: Components READ via selectors. SceneManager WRITES via getState().
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { SceneState, SceneActions, SceneId, SceneTransitionState } from '@types-app'

const INITIAL_STATE: SceneState = {
  currentScene:    'ARRIVAL',
  previousScene:   null,
  transitionState: 'idle',
  sceneProgress:   0,
  isLocked:        false,
  sceneHistory:    ['ARRIVAL'],
}

type SceneStore = SceneState & SceneActions

export const useSceneStore = create<SceneStore>()(
  // subscribeWithSelector allows fine-grained subscriptions in non-React code
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    setScene: (scene: SceneId) =>
      set((state) => ({
        currentScene:  scene,
        previousScene: state.currentScene,
      })),

    setPreviousScene: (scene: SceneId | null) =>
      set({ previousScene: scene }),

    setTransitionState: (transitionState: SceneTransitionState) =>
      set({ transitionState }),

    // NOTE: sceneProgress is intentionally NOT written from React components.
    // ScrollNarrativeSystem and VideoEngine update this via getState().setProgress()
    setProgress: (sceneProgress: number) =>
      set({ sceneProgress }),

    setLocked: (isLocked: boolean) =>
      set({ isLocked }),

    pushHistory: (scene: SceneId) =>
      set((state) => ({
        sceneHistory: [...state.sceneHistory, scene],
      })),

    reset: () => set(INITIAL_STATE),
  }))
)

// ─── Granular Selectors ───────────────────────────────────────────────────
// Import these in components to avoid unnecessary re-renders.
// Components subscribed to currentScene do NOT re-render on progress change.

export const selectCurrentScene    = (s: SceneStore) => s.currentScene
export const selectPreviousScene   = (s: SceneStore) => s.previousScene
export const selectTransitionState = (s: SceneStore) => s.transitionState
export const selectSceneProgress   = (s: SceneStore) => s.sceneProgress
export const selectIsLocked        = (s: SceneStore) => s.isLocked
export const selectSceneHistory    = (s: SceneStore) => s.sceneHistory
