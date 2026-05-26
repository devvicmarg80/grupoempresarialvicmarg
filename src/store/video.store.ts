// ─── Video Store ─────────────────────────────────────────────────────────────
// VideoEngine state. Only VideoEngine writes. Components read selectively.
// ───────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { VideoState, VideoActions, PlaybackState, VideoQuality, MobileVideoStrategy } from '@types-app'

const INITIAL_STATE: VideoState = {
  activeVideoId:  null,
  playbackState:  'idle',
  qualityLevel:   '720p',
  bufferProgress: 0,
  currentTime:    0,
  duration:       0,
  preloadQueue:   [],
  mobileStrategy: 'hls',
  stallCount:     0,
  lastStallAt:    null,
  error:          null,
}

type VideoStore = VideoState & VideoActions

export const useVideoStore = create<VideoStore>()(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    setActiveVideo: (id) => set({ activeVideoId: id, error: null }),

    setPlaybackState: (state: PlaybackState) =>
      set({ playbackState: state }),

    setQuality: (quality: VideoQuality) =>
      set({ qualityLevel: quality }),

    setBufferProgress: (progress) =>
      set({ bufferProgress: Math.min(1, Math.max(0, progress)) }),

    setCurrentTime: (time) => set({ currentTime: time }),

    setDuration: (duration) => set({ duration }),

    addToPreloadQueue: (sceneId) =>
      set((state) => ({
        preloadQueue: state.preloadQueue.includes(sceneId)
          ? state.preloadQueue
          : [...state.preloadQueue, sceneId],
      })),

    removeFromPreloadQueue: (sceneId) =>
      set((state) => ({
        preloadQueue: state.preloadQueue.filter((id) => id !== sceneId),
      })),

    setMobileStrategy: (strategy: MobileVideoStrategy) =>
      set({ mobileStrategy: strategy }),

    incrementStallCount: () =>
      set((state) => ({
        stallCount: state.stallCount + 1,
        lastStallAt: Date.now(),
      })),

    resetStallCount: () => set({ stallCount: 0, lastStallAt: null }),

    setError: (error) => set({ error, playbackState: error ? 'error' : 'idle' }),

    reset: () => set(INITIAL_STATE),
  }))
)

// ─── Selectors ─────────────────────────────────────────────────────────────
export const selectPlaybackState  = (s: VideoStore) => s.playbackState
export const selectVideoQuality   = (s: VideoStore) => s.qualityLevel
export const selectBufferProgress = (s: VideoStore) => s.bufferProgress
export const selectCurrentTime    = (s: VideoStore) => s.currentTime
export const selectStallCount     = (s: VideoStore) => s.stallCount
export const selectMobileStrategy = (s: VideoStore) => s.mobileStrategy
export const selectPreloadQueue   = (s: VideoStore) => s.preloadQueue
export const selectVideoError     = (s: VideoStore) => s.error
