import { useEffect, useState } from 'react'
import { useGalleryStore } from '@/store/useGalleryStore'

export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)')
    const update = () => setFine(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return fine
}

export function useInteractionEnabled(): boolean {
  const reducedMotion = useGalleryStore((state) => state.reducedMotion)
  const finePointer = useFinePointer()
  return finePointer && !reducedMotion
}
