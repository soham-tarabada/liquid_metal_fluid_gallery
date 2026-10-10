import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { GalleryItem } from '@/data/gallery'
import { buildSrcSet, DETAIL_SIZES, placeholderBackground } from '@/data/gallery'
import { lockScroll, unlockScroll } from '@/lib/lenisInstance'
import { useGalleryStore } from '@/store/useGalleryStore'

type DetailViewProps = {
  item: GalleryItem
  origin: { x: number; y: number } | null
  onClose: () => void
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'

export function DetailView({ item, origin, onClose }: DetailViewProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useGalleryStore((state) => state.reducedMotion)

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    lockScroll()
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlockScroll()
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  useLayoutEffect(() => {
    const backdrop = backdropRef.current
    if (!backdrop) return

    if (reducedMotion) {
      gsap.set(backdrop, { clipPath: 'none', opacity: 1 })
      return
    }

    const x = origin?.x ?? window.innerWidth / 2
    const y = origin?.y ?? window.innerHeight / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const tween = gsap.fromTo(
      backdrop,
      { clipPath: `circle(0px at ${x}px ${y}px)` },
      {
        clipPath: `circle(${radius}px at ${x}px ${y}px)`,
        duration: 0.85,
        ease: 'power2.inOut',
      },
    )

    return () => {
      tween.kill()
    }
  }, [origin, reducedMotion])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`detail-title-${item.id}`}
      className="fixed inset-0 z-40"
    >
      <div ref={backdropRef} className="absolute inset-0 bg-void/95 backdrop-blur-xl" />

      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        ref={panelRef}
        className="relative mx-auto flex h-full w-full max-w-6xl flex-col gap-8 overflow-y-auto px-6 py-16 sm:px-10 lg:flex-row lg:items-center lg:gap-16"
      >
        <div
          data-flip-id={item.id}
          className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/12 lg:w-1/2"
          style={{
            aspectRatio: `${item.image.width} / ${item.image.height}`,
            background: placeholderBackground(item.accent),
          }}
        >
          {item.image.src ? (
            <img
              src={item.image.src}
              srcSet={buildSrcSet(item.image.src)}
              sizes={DETAIL_SIZES}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <span className="sr-only">{item.image.alt}</span>
          )}
        </div>

        <div className="flex flex-col gap-5 lg:w-1/2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: item.accent }}
            />
            <span className="font-mono text-[11px] tracking-[0.22em] text-chrome-700 uppercase">
              {item.category} · {item.year}
            </span>
          </div>

          <h2
            id={`detail-title-${item.id}`}
            className="font-display text-4xl leading-[1.02] font-semibold tracking-tight text-chrome-100 sm:text-5xl"
          >
            {item.title}
          </h2>

          <p className="text-sm text-chrome-300">{item.subtitle}</p>
          <p className="max-w-prose text-sm leading-relaxed text-chrome-500">{item.description}</p>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="mt-2 w-fit rounded-full border border-white/15 px-5 py-2 text-xs tracking-[0.18em] text-chrome-300 uppercase transition-colors duration-300 hover:border-white/35 hover:text-chrome-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
