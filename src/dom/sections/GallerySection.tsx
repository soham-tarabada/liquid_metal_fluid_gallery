import { galleryItems } from '@/data/gallery'
import { GalleryGrid } from '@/dom/Gallery/GalleryGrid'

export function GallerySection() {
  return (
    <section id="work" className="relative px-6 py-24 sm:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12">
        <div className="flex items-end justify-between gap-6 border-b border-white/8 pb-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-chrome-100 sm:text-3xl">
            Selected work
          </h2>
          <span className="text-xs tracking-[0.18em] text-chrome-700 uppercase">
            {galleryItems.length} projects
          </span>
        </div>

        <GalleryGrid />
      </div>
    </section>
  )
}
