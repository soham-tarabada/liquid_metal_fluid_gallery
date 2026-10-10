import { lazy, Suspense } from 'react'
import { useInteractionEnabled } from '@/lib/useInteractionEnabled'
import { useQualityProfile } from '@/store/useGalleryStore'

const CursorTrailLayer = lazy(() => import('@/dom/CursorTrailLayer'))

export function CursorTrail() {
  const enabled = useInteractionEnabled()
  const profile = useQualityProfile()

  if (!enabled || !profile.enableCursorTrail) return null

  return (
    <Suspense fallback={null}>
      <CursorTrailLayer />
    </Suspense>
  )
}
