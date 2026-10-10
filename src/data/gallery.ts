export type GalleryImage = {
  src: string | null
  alt: string
  width: number
  height: number
}

export type GalleryItem = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  accent: string
  year: number
  category: string
  featured: boolean
  image: GalleryImage
}

export const galleryItems: GalleryItem[] = [
  {
    id: 'mercury-drift',
    slug: 'mercury-drift',
    title: 'Mercury Drift',
    subtitle: 'Kinetic sculpture, liquid metal',
    description:
      'A slow-moving mass of mercury held in a magnetic field, photographed at 240fps as the surface tension breaks and reforms.',
    accent: '#8fb7ff',
    year: 2024,
    category: 'Sculpture',
    featured: true,
    image: { src: null, alt: 'A pool of mercury splitting into two joined droplets.', width: 1600, height: 2000 },
  },
  {
    id: 'oil-bloom',
    slug: 'oil-bloom',
    title: 'Oil Bloom',
    subtitle: 'Macro photography series',
    description:
      'Iridescent films spreading across still water, lit from below so the interference patterns read as pure colour.',
    accent: '#ff9ecf',
    year: 2024,
    category: 'Photography',
    featured: false,
    image: { src: null, alt: 'Iridescent oil film spreading in concentric rings on water.', width: 1600, height: 1200 },
  },
  {
    id: 'chrome-fold',
    slug: 'chrome-fold',
    title: 'Chrome Fold',
    subtitle: 'Procedural study',
    description:
      'Signed-distance fields folded through themselves until the surface stops resembling geometry and starts resembling liquid.',
    accent: '#c9d3e0',
    year: 2023,
    category: 'Procedural',
    featured: true,
    image: { src: null, alt: 'A folded chrome surface with mirror-bright creases.', width: 1600, height: 1600 },
  },
  {
    id: 'gallium-hour',
    slug: 'gallium-hour',
    title: 'Gallium Hour',
    subtitle: 'Time-lapse installation',
    description:
      'Gallium melting at body temperature across a copper plate, recorded over one hour and replayed in ninety seconds.',
    accent: '#ffb27a',
    year: 2023,
    category: 'Installation',
    featured: false,
    image: { src: null, alt: 'Gallium melting into a bright pool on a copper plate.', width: 1600, height: 2400 },
  },
  {
    id: 'surface-tension',
    slug: 'surface-tension',
    title: 'Surface Tension',
    subtitle: 'Generative print series',
    description:
      'Metaball fields resolved at print resolution, each plate a single frame from a simulation that never repeats.',
    accent: '#7fe3d4',
    year: 2023,
    category: 'Print',
    featured: false,
    image: { src: null, alt: 'Merging circular forms resolved as a smooth continuous outline.', width: 1600, height: 1200 },
  },
  {
    id: 'null-reflection',
    slug: 'null-reflection',
    title: 'Null Reflection',
    subtitle: 'Mirror environment',
    description:
      'A room where every surface is polished to the same roughness, so the eye loses track of which reflection is the original.',
    accent: '#a99cff',
    year: 2022,
    category: 'Installation',
    featured: true,
    image: { src: null, alt: 'A mirrored room with no discernible horizon line.', width: 1600, height: 1000 },
  },
  {
    id: 'ferro-garden',
    slug: 'ferro-garden',
    title: 'Ferro Garden',
    subtitle: 'Magnetic fluid study',
    description:
      'Ferrofluid spiking into repeating cones under a shifting magnet array, shot dry against black acrylic.',
    accent: '#6f8fff',
    year: 2022,
    category: 'Photography',
    featured: false,
    image: { src: null, alt: 'Ferrofluid forming a field of sharp black spikes.', width: 1600, height: 1600 },
  },
  {
    id: 'cold-solder',
    slug: 'cold-solder',
    title: 'Cold Solder',
    subtitle: 'Material portrait',
    description:
      'Solder frozen mid-pour, lit with a single soft box to keep the specular highlight narrow enough to read as metal.',
    accent: '#d8c39a',
    year: 2021,
    category: 'Photography',
    featured: false,
    image: { src: null, alt: 'A stream of solder frozen in mid-pour against black.', width: 1600, height: 2000 },
  },
]

export const getGalleryItem = (slug: string): GalleryItem | undefined =>
  galleryItems.find((item) => item.slug === slug)

const CDN_BASE = import.meta.env.VITE_IMAGE_CDN ?? ''
const SRCSET_WIDTHS = [480, 768, 1024, 1440, 1920]

export const GALLERY_SIZES = '(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw'
export const DETAIL_SIZES = '(min-width: 1024px) 48vw, 92vw'

export const buildSrcSet = (src: string | null): string | undefined => {
  if (!src || !CDN_BASE) return undefined
  return SRCSET_WIDTHS.map(
    (width) => `${CDN_BASE}${src}?w=${width}&fm=webp&q=78 ${width}w`,
  ).join(', ')
}

export const placeholderBackground = (accent: string): string =>
  `radial-gradient(120% 120% at 25% 15%, ${accent}38 0%, ${accent}12 38%, transparent 68%), linear-gradient(155deg, #14141a 0%, #0b0b0f 55%, #050507 100%)`
