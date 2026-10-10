import { useEffect, useMemo, useState } from 'react'
import { readDevFlags } from '@/lib/devFlags'
import { QUALITY_PROFILES } from '@/lib/quality'
import { useGalleryStore } from '@/store/useGalleryStore'

type Sample = {
  fps: number
  worst: number
}

export function PerfHud() {
  const flags = useMemo(() => readDevFlags(), [])
  const tier = useGalleryStore((state) => state.qualityTier)
  const sceneActive = useGalleryStore((state) => state.sceneActive)
  const [sample, setSample] = useState<Sample>({ fps: 0, worst: 0 })

  useEffect(() => {
    if (!flags.perf) return

    let frame = 0
    let frames = 0
    let longest = 0
    let windowStart = performance.now()
    let previous = windowStart

    const tick = (now: number) => {
      const delta = now - previous
      previous = now
      frames += 1
      longest = Math.max(longest, delta)

      if (now - windowStart >= 500) {
        setSample({
          fps: Math.round((frames * 1000) / (now - windowStart)),
          worst: Math.round(longest * 10) / 10,
        })
        frames = 0
        longest = 0
        windowStart = now
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [flags.perf])

  if (!flags.perf) return null

  const profile = QUALITY_PROFILES[tier]
  const steps = flags.steps ?? profile.raymarchSteps
  const scale = flags.scale ?? profile.renderScale
  const balls = flags.balls ?? profile.metaballCount

  const rows: [string, string][] = [
    ['fps', `${sample.fps}`],
    ['worst frame', `${sample.worst} ms`],
    ['tier', tier + (flags.tier ? ' (forced)' : '')],
    ['steps', `${steps}`],
    ['scale', `${scale}`],
    ['metaballs', `${balls}`],
    ['dpr', `${Math.round(window.devicePixelRatio * 100) / 100}`],
    ['raymarcher', sceneActive ? 'running' : 'paused'],
    ['goo', document.documentElement.getAttribute('data-goo') ?? 'on'],
  ]

  return (
    <div aria-hidden="true"
      className="pointer-events-none fixed right-4 bottom-4 z-40 min-w-44 rounded-lg border border-white/12 bg-black/70 p-3 font-mono text-[11px] text-chrome-300 backdrop-blur-sm">
      <div className="mb-2 tracking-[0.2em] text-chrome-700 uppercase">Perf</div>
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-6 leading-relaxed">
          <span className="text-chrome-700">{label}</span>
          <span
            className={
              (label === 'fps' && sample.fps < 50) || value === 'paused'
                ? 'text-accent-warm'
                : ''
            }
          >
            {value}
          </span>
        </div>
      ))}
      <div className="mt-2 border-t border-white/10 pt-2 text-[10px] leading-snug text-chrome-700">
        ?perf&tier=high&steps=64&scale=0.5&balls=4&goo=off
      </div>
    </div>
  )
}
