import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function bigScales(k: Kit, wd: Wood) {
  // a great beam scale on a post, its pans on chains, a box of weights beside it
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.75, v1: D / 2 })
  k.box({ side: wd.dark, top: null, u0: -0.05, y0: 0.75, v0: -0.05, u1: 0.05, y1: 1.7, v1: 0.05 })
  k.box({ side: M.iron, top: null, u0: -W / 2 + 0.08, y0: 1.65, v0: -0.02, u1: W / 2 - 0.08, y1: 1.7, v1: 0.02 })
  for (const su of [-1, 1]) {
    const u = su * (W / 2 - 0.15)
    for (const dv of [-0.1, 0.1]) k.box({ side: M.iron, top: null, u0: u + dv * 0.3 - 0.005, y0: 1.0, v0: dv - 0.005, u1: u + dv * 0.3 + 0.005, y1: 1.66, v1: dv + 0.005 })
    k.cyl({ side: brass, top: null, u: u, v: 0, y0: 0.97, y1: 1.0, r0: 0.16, r1: 0.16, seg: 10 })
  }
  for (const t = { value: 0 }; t.value < 4; t.value++)
    k.cyl({ side: brass, top: null, u: -0.08 + t.value * 0.06, v: D / 2 - 0.12, y0: 0.75, y1: 0.79 + t.value * 0.015, r0: 0.025 + t.value * 0.005, r1: 0.025 + t.value * 0.005, seg: 6 })
}
