import { useEffect } from 'react'
import { useGalleryStore } from '@/store/useGalleryStore'

export function useSceneActivity(selector: string) {
  useEffect(() => {
    const target = document.querySelector(selector)
    const setSceneActive = useGalleryStore.getState().setSceneActive

    let inView = true
    let pageVisible = document.visibilityState === 'visible'

    const sync = () => setSceneActive(inView && pageVisible)

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === 'visible'
      sync()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    let observer: IntersectionObserver | null = null

    if (target) {
      observer = new IntersectionObserver(
        (entries) => {
          inView = entries[0]?.isIntersecting ?? true
          sync()
        },
        { rootMargin: '15% 0px', threshold: 0 },
      )
      observer.observe(target)
    }

    sync()

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      observer?.disconnect()
      setSceneActive(true)
    }
  }, [selector])
}
