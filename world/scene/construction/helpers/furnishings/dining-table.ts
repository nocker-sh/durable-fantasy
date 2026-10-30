import type { Wood } from "#/world/scene/construction/furnishings"
import { linen, clay, glaze } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

// ---------------------------------------------------------------- tables and desks

export function diningTable(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.legs({ m: wd.dark, h: 0.7, t: 0.07, inset: 0.06 })
  for (const sv of [-1, 1]) k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.08, y0: 0.58, v0: sv * (D / 2 - 0.1) - 0.02, u1: W / 2 - 0.08, y1: 0.68, v1: sv * (D / 2 - 0.1) + 0.02 }) // aprons
  k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.12, y0: 0.1, v0: -0.03, u1: W / 2 - 0.12, y1: 0.16, v1: 0.03 }) // stretcher
  k.slab({ m: wd.top, y: 0.7, t: 0.06 })
  // a runner, a jug and a bowl or two left on it
  if (r(seed, 6) > 0.4) k.box({ side: linen, top: linen, u0: -W * 0.3, y0: 0.76, v0: -D * 0.2, u1: W * 0.3, y1: 0.765, v1: D * 0.2 })
  k.cyl({ side: clay, top: null, u: -W * 0.2, v: 0, y0: 0.76, y1: 0.92, r0: 0.06, r1: 0.05 })
  k.cyl({ side: glaze[Math.floor(r(seed, 7) * 4)], top: null, u: W * 0.15, v: D * 0.1, y0: 0.76, y1: 0.81, r0: 0.06, r1: 0.09 })
}
