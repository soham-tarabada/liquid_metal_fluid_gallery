import studioChrome from '@/assets/hdri/studio-chrome-512.hdr'

export const HDRI = {
  studioChrome,
} as const

export type HdriName = keyof typeof HDRI
