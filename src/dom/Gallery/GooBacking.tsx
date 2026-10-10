import type { GalleryItem } from '@/data/gallery'
import type { TileRect } from '@/lib/useTileRects'

type GooBackingProps = {
  items: GalleryItem[]
  rects: TileRect[]
  hoveredIndex: number
  columns: number
}

const PAD = 8
const PULL = 30
const LIFT = 1.06

export function GooBacking({ items, rects, hoveredIndex, columns }: GooBackingProps) {
  if (rects.length === 0) return null

  const target = hoveredIndex >= 0 ? rects[hoveredIndex] : null

  return (
    <div aria-hidden="true" className="goo pointer-events-none absolute inset-0 -z-10">
      {rects.map((rect, index) => {
        const item = items[index]
        if (!item) return null

        const isHovered = index === hoveredIndex
        const row = Math.floor(index / columns)
        const targetRow = hoveredIndex >= 0 ? Math.floor(hoveredIndex / columns) : -1
        const isNeighbour =
          hoveredIndex >= 0 &&
          !isHovered &&
          ((row === targetRow && Math.abs(index - hoveredIndex) === 1) ||
            Math.abs(index - hoveredIndex) === columns)

        let dx = 0
        let dy = 0

        if (isNeighbour && target) {
          const vx = target.left + target.width / 2 - (rect.left + rect.width / 2)
          const vy = target.top + target.height / 2 - (rect.top + rect.height / 2)
          const length = Math.hypot(vx, vy) || 1
          dx = (vx / length) * PULL
          dy = (vy / length) * PULL
        }

        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: rect.left - PAD,
              top: rect.top - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
            }}
          >
            <div
              className="size-full"
              style={{
                transform: `translate3d(${dx}px, ${dy}px, 0) scale(${isHovered ? LIFT : 1})`,
                transition: 'transform 0.55s var(--ease-liquid)',
              }}
            >
              <div
                data-backing={index}
                className="size-full rounded-[26px]"
                style={{
                  background: item.accent,
                  opacity: isHovered ? 0.55 : 0.28,
                  transition: 'opacity 0.45s var(--ease-liquid)',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
