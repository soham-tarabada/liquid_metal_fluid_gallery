import { useEffect } from 'react'
import { useGalleryStore } from '@/store/useGalleryStore'

export function useScrollProgress() {
  useEffect(() => {
    let frame = 0

    const flush = () => {
      frame = 0
      const viewport = window.innerHeight || 1
      const progress = Math.min(1, Math.max(0, window.scrollY / viewport))
      useGalleryStore.getState().setScrollProgress(progress)
    }

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(flush)
    }

    flush()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])
}
