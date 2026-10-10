import { useEffect } from 'react'
import { subscribePointer } from '@/lib/pointerBus'
import { useGalleryStore } from '@/store/useGalleryStore'

export function usePointerTracking() {
  useEffect(
    () =>
      subscribePointer((x, y) => {
        useGalleryStore
          .getState()
          .setPointer((x / window.innerWidth) * 2 - 1, -((y / window.innerHeight) * 2 - 1))
      }),
    [],
  )
}
