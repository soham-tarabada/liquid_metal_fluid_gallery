import { create } from 'zustand'
import { readDevFlags } from '@/lib/devFlags'
import {
  detectQualityTier,
  prefersReducedMotion,
  QUALITY_PROFILES,
  type QualityProfile,
  type QualityTier,
} from '@/lib/quality'

type GalleryState = {
  progress: number
  isBooted: boolean
  hasEntered: boolean
  activeItemId: string | null
  hoveredItemId: string | null
  qualityTier: QualityTier
  reducedMotion: boolean
  pointer: { x: number; y: number }
  scrollProgress: number
  sceneActive: boolean
  setProgress: (progress: number) => void
  setBooted: (isBooted: boolean) => void
  setEntered: (hasEntered: boolean) => void
  setActiveItem: (id: string | null) => void
  setHoveredItem: (id: string | null) => void
  setQualityTier: (tier: QualityTier) => void
  setReducedMotion: (reducedMotion: boolean) => void
  setPointer: (x: number, y: number) => void
  setScrollProgress: (scrollProgress: number) => void
  setSceneActive: (sceneActive: boolean) => void
}

const initialTier: QualityTier =
  typeof window === 'undefined' ? 'medium' : (readDevFlags().tier ?? detectQualityTier())

export const useGalleryStore = create<GalleryState>((set) => ({
  progress: 0,
  isBooted: false,
  hasEntered: false,
  activeItemId: null,
  hoveredItemId: null,
  qualityTier: initialTier,
  reducedMotion: prefersReducedMotion(),
  pointer: { x: 0, y: 0 },
  scrollProgress: 0,
  sceneActive: true,
  setProgress: (progress) => set({ progress: Math.min(1, Math.max(0, progress)) }),
  setBooted: (isBooted) => set({ isBooted }),
  setEntered: (hasEntered) => set({ hasEntered }),
  setActiveItem: (activeItemId) => set({ activeItemId }),
  setHoveredItem: (hoveredItemId) => set({ hoveredItemId }),
  setQualityTier: (qualityTier) => set({ qualityTier }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setSceneActive: (sceneActive) => set({ sceneActive }),
}))

export const useQualityProfile = (): QualityProfile =>
  QUALITY_PROFILES[useGalleryStore((state) => state.qualityTier)]
