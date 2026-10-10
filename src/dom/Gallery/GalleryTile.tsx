import { useCallback, useRef } from 'react'
import type { GalleryItem } from '@/data/gallery'
import { buildSrcSet, GALLERY_SIZES, placeholderBackground } from '@/data/gallery'
import { useDragMorph } from '@/lib/useDragMorph'
import { useInteractionEnabled } from '@/lib/useInteractionEnabled'

type GalleryTileProps = {
  item: GalleryItem
  index: number
  getBacking: (index: number) => HTMLElement | null
  isActive: boolean
  isDimmed: boolean
  onOpen: (item: GalleryItem, element: HTMLElement) => void
  onHover: (id: string | null) => void
}

export function GalleryTile({
  item,
  index,
  getBacking,
  isActive,
  isDimmed,
  onOpen,
  onHover,
}: GalleryTileProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const enabled = useInteractionEnabled()

  const getOwnBacking = useCallback(() => getBacking(index), [getBacking, index])

  useDragMorph(buttonRef, { getBacking: getOwnBacking, disabled: !enabled })

  return (
    <li data-tile className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => onOpen(item, event.currentTarget)}
        onMouseEnter={() => onHover(item.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(item.id)}
        onBlur={() => onHover(null)}
        aria-label={`Open ${item.title}`}
        className={`group flex w-full cursor-pointer flex-col gap-4 text-left transition-opacity duration-500 ease-liquid focus-visible:outline-offset-8 ${
          isDimmed ? 'opacity-45' : 'opacity-100'
        }`}
      >
        <div
          data-flip-id={isActive ? undefined : item.id}
          className="relative w-full overflow-hidden rounded-xl border border-white/10"
          style={{
            aspectRatio: `${item.image.width} / ${item.image.height}`,
            background: placeholderBackground(item.accent),
            visibility: isActive ? 'hidden' : 'visible',
          }}
        >
          {item.image.src ? (
            <img
              src={item.image.src}
              srcSet={buildSrcSet(item.image.src)}
              sizes={GALLERY_SIZES}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <span className="sr-only">{item.image.alt}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-base font-medium tracking-tight text-chrome-100">
              {item.title}
            </h3>
            <span className="shrink-0 font-mono text-[11px] text-chrome-700">{item.year}</span>
          </div>
          <p className="text-xs text-chrome-500">{item.subtitle}</p>
        </div>
      </button>
    </li>
  )
}
