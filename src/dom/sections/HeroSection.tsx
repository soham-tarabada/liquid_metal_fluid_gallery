import { LiquidText } from '@/dom/LiquidText'
import { Magnetic } from '@/dom/Magnetic'

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative flex min-h-dvh flex-col justify-end px-6 pb-16 sm:px-10"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <h1 className="font-display text-[clamp(2.75rem,9vw,8rem)] leading-[0.92] font-semibold tracking-[-0.03em] text-chrome-100">
          <LiquidText>Liquid</LiquidText>
          <br />
          <LiquidText>Metal</LiquidText>
        </h1>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-chrome-500">
            A studio working in reflective surfaces, magnetic fluids and procedural
            geometry — material studies that behave like they are still moving.
          </p>
          <Magnetic className="w-fit" radius={70} strength={0.4}>
            <a
              href="#work"
              className="block rounded-full border border-white/15 px-6 py-3 text-xs tracking-[0.22em] text-chrome-300 uppercase transition-colors duration-300 hover:border-white/35 hover:text-chrome-100"
            >
              View work
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
