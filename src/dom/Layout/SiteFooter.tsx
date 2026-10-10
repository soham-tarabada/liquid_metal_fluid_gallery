import { LiquidText } from '@/dom/LiquidText'
import { Magnetic } from '@/dom/Magnetic'

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-white/8 px-6 py-16 sm:px-10"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          <LiquidText
            as="h2"
            className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-5xl"
          >
            Let's make something that moves.
          </LiquidText>
          <Magnetic className="w-fit" radius={60} strength={0.32}>
            <a
              href="mailto:studio@liquidmetal.test"
              className="block text-sm text-chrome-300 underline decoration-white/25 underline-offset-4 transition-colors duration-300 hover:text-chrome-100"
            >
              studio@liquidmetal.test
            </a>
          </Magnetic>
        </div>
        <p className="text-xs tracking-[0.18em] text-chrome-700 uppercase">
          © {new Date().getFullYear()} Liquid Metal
        </p>
      </div>
    </footer>
  )
}
