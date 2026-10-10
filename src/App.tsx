import { lazy, Suspense, useCallback, useState } from 'react'
import { CursorTrail } from '@/dom/CursorTrail'
import { GooFilterDefs } from '@/dom/Gallery/GooFilterDefs'
import { HeroStill } from '@/dom/HeroStill'
import { SiteFooter } from '@/dom/Layout/SiteFooter'
import { SiteHeader } from '@/dom/Layout/SiteHeader'
import { LoadingScreen } from '@/dom/LoadingScreen'
import { PerfHud } from '@/dom/PerfHud'
import { SceneBoundary } from '@/dom/SceneBoundary'
import { GallerySection } from '@/dom/sections/GallerySection'
import { HeroSection } from '@/dom/sections/HeroSection'
import { SmoothScroll } from '@/dom/SmoothScroll'
import { useBootProgress } from '@/lib/useBootProgress'
import { useGooMode } from '@/lib/useGooMode'
import { useGalleryStore } from '@/store/useGalleryStore'
import { usePointerTracking } from '@/lib/usePointerTracking'
import { useScrollProgress } from '@/lib/useScrollProgress'
import { useSceneActivity } from '@/lib/useSceneActivity'

const SceneCanvas = lazy(() => import('@/scene/SceneCanvas'))

export default function App() {
  const [sceneReady, setSceneReady] = useState(false)
  const sceneActive = useGalleryStore((state) => state.sceneActive)
  const reducedMotion = useGalleryStore((state) => state.reducedMotion)
  const qualityTier = useGalleryStore((state) => state.qualityTier)
  const useStillHero = reducedMotion || qualityTier === 'low'
  const markSceneReady = useCallback(() => setSceneReady(true), [])

  useBootProgress(sceneReady, !useStillHero)
  usePointerTracking()
  useScrollProgress()
  useSceneActivity('#top')
  useGooMode()

  return (
    <>
      <GooFilterDefs />
      <LoadingScreen />
      <PerfHud />

      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-chrome-100 focus:px-4 focus:py-2 focus:text-sm focus:text-void"
      >
        Skip to work
      </a>

      <SmoothScroll>
        <div className="relative">
          {useStillHero ? (
            <HeroStill />
          ) : (
            <div
              aria-hidden="true"
              className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700 ease-liquid ${
                sceneActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <SceneBoundary onFailure={markSceneReady}>
                <Suspense fallback={null}>
                  <SceneCanvas onReady={markSceneReady} />
                </Suspense>
              </SceneBoundary>
            </div>
          )}

          <SiteHeader />
          <main>
            <HeroSection />
            <GallerySection />
          </main>
          <SiteFooter />
        </div>
      </SmoothScroll>

      <CursorTrail />
    </>
  )
}
