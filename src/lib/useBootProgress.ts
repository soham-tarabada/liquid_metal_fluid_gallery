import { useEffect } from 'react'
import { useGalleryStore } from '@/store/useGalleryStore'

const MIN_DURATION_MS = 900
const MAX_WAIT_MS = 6000

export function useBootProgress(sceneReady: boolean, sceneRequired = true) {
  const setProgress = useGalleryStore((state) => state.setProgress)
  const setBooted = useGalleryStore((state) => state.setBooted)
  const setReducedMotion = useGalleryStore((state) => state.setReducedMotion)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [setReducedMotion])

  useEffect(() => {
    const start = performance.now()
    let frame = 0
    let settled = false

    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    let fontsDone = false
    void fontsReady.then(() => {
      fontsDone = true
    })

    const loop = () => {
      const elapsed = performance.now() - start
      const timeShare = Math.min(1, elapsed / MIN_DURATION_MS) * 0.55
      const fontShare = fontsDone ? 0.15 : 0
      const sceneShare = sceneReady || !sceneRequired ? 0.3 : 0
      const stalled = elapsed > MAX_WAIT_MS
      const next = stalled ? 1 : timeShare + fontShare + sceneShare

      setProgress(next)

      if (next >= 1 && !settled) {
        settled = true
        setBooted(true)
        return
      }

      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [sceneReady, sceneRequired, setProgress, setBooted])
}
