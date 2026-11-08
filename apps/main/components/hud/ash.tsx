import "#resources/packages/fontsource/shippori-mincho/400"
import { useMemo } from "react"

/** A few fine grains of ash drifting down, barely there. */
export function Ash() {
  const grains = useMemo(() => Array.from({ length: 28 }, (_, k) => ({ left: (k * 37) % 100, delay: -((k * 53) % 40), dur: 26 + ((k * 17) % 18), size: k % 3 === 0 ? 2 : 1 })), [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {grains.map((g, k) => (
        <span
          key={k}
          className="absolute top-[-2%] rounded-full bg-[#8a8680] opacity-40"
          style={{ left: `${g.left}%`, width: g.size, height: g.size, animation: `ash-fall ${g.dur}s linear ${g.delay}s infinite` }}
        />
      ))}
      <style>{"@keyframes ash-fall { from { transform: translate(0, 0); } to { transform: translate(24px, 104vh); } }"}</style>
    </div>
  )
}
