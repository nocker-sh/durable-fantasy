import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { clay } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function pottersWheel(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.top, top: wd.top, u0: -W / 2 + 0.05, y0: 0.4, v0: D / 2 - 0.3, u1: W / 2 - 0.05, y1: 0.45, v1: D / 2 - 0.05 }) // the seat
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: su * (W / 2 - 0.1) - 0.03, y0: 0, v0: D / 2 - 0.2, u1: su * (W / 2 - 0.1) + 0.03, y1: 0.4, v1: D / 2 - 0.14 })
  k.cyl({ side: M.stoneDark, top: null, u: 0, v: -0.05, y0: 0.05, y1: 0.15, r0: 0.35, r1: 0.35, seg: 12 }) // the kick wheel
  k.cyl({ side: wd.dark, top: null, u: 0, v: -0.05, y0: 0.15, y1: 0.62, r0: 0.03, r1: 0.03 })
  k.cyl({ side: wd.body, top: wd.top, u: 0, v: -0.05, y0: 0.62, y1: 0.66, r0: 0.18, r1: 0.18, seg: 12 })
  k.cyl({ side: clay, top: null, u: 0, v: -0.05, y0: 0.66, y1: 0.66 + 0.12 + r(seed, 1) * 0.1, r0: 0.08, r1: 0.06, seg: 10 }) // a pot half thrown
  k.cyl({ side: M.water, top: null, u: W / 2 - 0.12, v: -D / 2 + 0.14, y0: 0, y1: 0.18, r0: 0.09, r1: 0.1, seg: 8 })
}
