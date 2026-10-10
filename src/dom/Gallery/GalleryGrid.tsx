import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { galleryItems, type GalleryItem } from '@/data/gallery'
import { DetailView } from '@/dom/Gallery/DetailView'
import { GalleryTile } from '@/dom/Gallery/GalleryTile'
import { GooBacking } from '@/dom/Gallery/GooBacking'
import { useGridColumns } from '@/lib/useGridColumns'
import { useTileRects } from '@/lib/useTileRects'
import { useGalleryStore } from '@/store/useGalleryStore'

gsap.registerPlugin(Flip)

type FlipState = ReturnType<typeof Flip.getState>

export function GalleryGrid() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLUListElement>(null)
  const flipState = useRef<FlipState | null>(null)

  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null)

  const getBacking = useCallback(
    (index: number) =>
      wrapperRef.current?.querySelector<HTMLElement>(`[data-backing="${index}"]`) ?? null,
    [],
  )

  const activeItemId = useGalleryStore((state) => state.activeItemId)
  const setActiveItem = useGalleryStore((state) => state.setActiveItem)
  const setHoveredItem = useGalleryStore((state) => state.setHoveredItem)

  const columns = useGridColumns(gridRef)
  const rects = useTileRects(wrapperRef, '[data-tile]', columns)

  const activeItem = galleryItems.find((item) => item.id === activeItemId) ?? null

  const handleHover = useCallback(
    (id: string | null) => {
      setHoveredItem(id)
      setHoveredIndex(id === null ? -1 : galleryItems.findIndex((item) => item.id === id))
    },
    [setHoveredItem],
  )

  const openItem = useCallback(
    (item: GalleryItem, element: HTMLElement) => {
      setHoveredIndex(-1)
      const rect = element.getBoundingClientRect()
      setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
      flipState.current = Flip.getState('[data-flip-id]')
      setActiveItem(item.id)
    },
    [setActiveItem],
  )

  const closeItem = useCallback(() => {
    flipState.current = Flip.getState('[data-flip-id]')
    setActiveItem(null)
  }, [setActiveItem])

  useLayoutEffect(() => {
    const state = flipState.current
    if (!state) return
    flipState.current = null

    const reducedMotion = useGalleryStore.getState().reducedMotion

    Flip.from(state, {
      duration: reducedMotion ? 0 : 0.75,
      ease: 'power2.inOut',
      absolute: true,
      scale: true,
    })
  }, [activeItemId])

  return (
    <div ref={wrapperRef} className="relative isolate">
      <GooBacking
        items={galleryItems}
        rects={rects}
        hoveredIndex={activeItemId ? -1 : hoveredIndex}
        columns={columns}
      />

      <ul
        ref={gridRef}
        className="grid grid-cols-1 gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      >
        {galleryItems.map((item, index) => (
          <GalleryTile
            key={item.id}
            item={item}
            index={index}
            getBacking={getBacking}
            isActive={item.id === activeItemId}
            isDimmed={hoveredIndex >= 0 && item.id !== galleryItems[hoveredIndex]?.id}
            onOpen={openItem}
            onHover={handleHover}
          />
        ))}
      </ul>

      {activeItem ? (
        <DetailView item={activeItem} origin={origin} onClose={closeItem} />
      ) : null}
    </div>
  )
}
