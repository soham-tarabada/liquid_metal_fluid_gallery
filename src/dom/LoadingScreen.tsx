import { useEffect, useState } from 'react'
import { useGalleryStore } from '@/store/useGalleryStore'

const BUBBLES = [
  { left: '26%', size: 14, delay: '0s' },
  { left: '52%', size: 20, delay: '0.75s' },
  { left: '72%', size: 11, delay: '1.5s' },
]

export function LoadingScreen() {
  const progress = useGalleryStore((state) => state.progress)
  const isBooted = useGalleryStore((state) => state.isBooted)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isBooted) return
    const timer = window.setTimeout(() => setDismissed(true), 700)
    return () => window.clearTimeout(timer)
  }, [isBooted])

  if (dismissed) return null

  const percent = Math.round(progress * 100)
  const fillTop = 132 - progress * 196

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${percent} percent`}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-void transition-opacity duration-700 ease-liquid ${
        isBooted ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative size-33 overflow-hidden rounded-full border border-white/12">
        <div className="goo-strong absolute inset-0">
          <div
            className="absolute left-1/2 size-44 -translate-x-1/2 rounded-full bg-chrome-100 transition-[top] duration-500 ease-liquid"
            style={{ top: `${fillTop}px` }}
          />
          {BUBBLES.map((bubble) => (
            <div
              key={bubble.left}
              className="absolute bottom-2 animate-rise rounded-full bg-chrome-100"
              style={{
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                animationDelay: bubble.delay,
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="font-mono text-xs tracking-[0.35em] text-chrome-500 uppercase">
          {percent.toString().padStart(3, '0')}
        </span>
        <span className="font-display text-sm tracking-tight text-chrome-700">
          Liquid Metal
        </span>
      </div>
    </div>
  )
}
