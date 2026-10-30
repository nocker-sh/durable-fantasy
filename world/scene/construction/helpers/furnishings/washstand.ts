import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { linen, glaze, wax } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function washstand(k: Kit, wd: Wood, seed: number) {
  // a stand with a basin let into its top, a jug in it, a towel on the rail and a cake of soap
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.legs({ m: wd.dark, h: 0.8, t: 0.045, inset: 0.03 })
  k.slab({ m: wd.body, y: 0.2, t: 0.03, W: W - 0.08, D: D - 0.08 })
  k.slab({ m: wd.top, y: 0.8, t: 0.04 })
  k.cyl({ side: glaze[(seed + 2) % glaze.length], top: M.water, u: 0, v: 0.02, y0: 0.8, y1: 0.9, r0: 0.12, r1: 0.18, seg: 10 })
  k.cyl({ side: glaze[(seed + 2) % glaze.length], top: null, u: 0.05, v: 0.02, y0: 0.9, y1: 1.06, r0: 0.06, r1: 0.04, seg: 7 })
  k.box({ side: wd.dark, top: null, u0: -W / 2 - 0.04, y0: 0.6, v0: -0.02, u1: -W / 2, y1: 0.64, v1: D / 2 - 0.05 })
  k.box({ side: linen, top: null, u0: -W / 2 - 0.05, y0: 0.38, v0: 0.02, u1: -W / 2 - 0.035, y1: 0.64, v1: D / 2 - 0.1 })
  k.box({ side: wax, top: null, u0: W / 2 - 0.12, y0: 0.84, v0: -D / 2 + 0.06, u1: W / 2 - 0.05, y1: 0.87, v1: -D / 2 + 0.12 })
  k.box({ side: wd.top, top: wd.top, u0: -W / 2, y0: 0.84, v0: -D / 2, u1: W / 2, y1: 1.0, v1: -D / 2 + 0.03 }) // the splash board
}
