import heroStill from '@/assets/hero-still.webp'

export function HeroStill() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <img
        src={heroStill}
        alt=""
        width={1600}
        height={900}
        decoding="async"
        fetchPriority="high"
        className="size-full object-contain opacity-95"
      />
    </div>
  )
}
