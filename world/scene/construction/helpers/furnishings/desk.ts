import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { paper, books, brass, wax } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function desk(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  // a pedestal of drawers on one side, legs on the other, a slanted writing top
  k.box({ side: wd.body, top: null, u0: W / 2 - 0.38, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.72, v1: D / 2 })
  for (const t = { value: 0 }; t.value < 3; t.value++) {
    k.box({ side: wd.dark, top: null, u0: W / 2 - 0.35, y0: 0.06 + t.value * 0.22, v0: D / 2, u1: W / 2 - 0.03, y1: 0.24 + t.value * 0.22, v1: D / 2 + 0.01 })
    k.box({ side: brass, top: null, u0: W / 2 - 0.21, y0: 0.14 + t.value * 0.22, v0: D / 2 + 0.01, u1: W / 2 - 0.17, y1: 0.16 + t.value * 0.22, v1: D / 2 + 0.03 })
  }
  for (const v of [-D / 2 + 0.05, D / 2 - 0.05]) k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.03, y0: 0, v0: v - 0.025, u1: -W / 2 + 0.08, y1: 0.72, v1: v + 0.025 })
  k.slab({ m: wd.top, y: 0.72, t: 0.05 })
  k.box({ side: wd.dark, top: wd.top, u0: -W / 2, y0: 0.77, v0: -D / 2, u1: W / 2, y1: 0.95, v1: -D / 2 + 0.12 }) // a rack of pigeonholes at the back
  for (const t = { value: 0 }; t.value < 4; t.value++)
    k.box({ side: paper, top: null, u0: -W / 2 + 0.1 + t.value * (W / 4), y0: 0.8, v0: -D / 2 + 0.11, u1: -W / 2 + 0.2 + t.value * (W / 4), y1: 0.9, v1: -D / 2 + 0.125 })
  // a ledger open, an inkwell, a candle
  k.box({ side: paper, top: paper, u0: -0.22, y0: 0.77, v0: -0.02, u1: 0.18, y1: 0.79, v1: D / 2 - 0.1 })
  k.box({ side: books[Math.floor(r(seed, 8) * books.length)], top: null, u0: -0.23, y0: 0.765, v0: -0.03, u1: 0.19, y1: 0.775, v1: D / 2 - 0.09 })
  k.cyl({ side: M.dark, top: null, u: W / 2 - 0.2, v: D * 0.1, y0: 0.77, y1: 0.83, r0: 0.03, r1: 0.025 })
  k.cyl({ side: brass, top: null, u: -W / 2 + 0.15, v: 0, y0: 0.77, y1: 0.79, r0: 0.05, r1: 0.05 })
  k.cyl({ side: wax, top: null, u: -W / 2 + 0.15, v: 0, y0: 0.79, y1: 0.92, r0: 0.015, r1: 0.015, seg: 6 })
}
