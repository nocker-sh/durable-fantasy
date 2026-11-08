import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { glass, clay, glaze, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { row } from "#/world/scene/construction/helpers/furnishings/row"

export function medicineCase(k: Kit, wd: Wood, seed: number) {
  // little drawers below with brass pulls, bottles in rows above
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const h = 1.9
  frame({ k: k, wd: wd, h: h, boards: [0.04, 0.85, 1.25, 1.6] })
  const cols = Math.max(3, Math.round(W / 0.25))
  for (const rr = { value: 0 }; rr.value < 4; rr.value++)
    for (const c = { value: 0 }; c.value < cols; c.value++) {
      const u0 = -W / 2 + 0.05 + (c.value * (W - 0.1)) / cols,
        u1 = u0 + (W - 0.1) / cols - 0.02
      const y0 = 0.08 + rr.value * 0.19
      k.box({ side: wd.body, top: null, u0: u0, y0: y0, v0: D / 2 - 0.02, u1: u1, y1: y0 + 0.17, v1: D / 2 })
      k.box({ side: brass, top: null, u0: (u0 + u1) / 2 - 0.02, y0: y0 + 0.07, v0: D / 2, u1: (u0 + u1) / 2 + 0.02, y1: y0 + 0.1, v1: D / 2 + 0.02 })
    }
  for (const b of [0.85, 1.25, 1.6])
    row({
      k: k,
      y: b,
      from: -W / 2 + 0.08,
      to: W / 2 - 0.1,
      put: (u, j) => {
        const g = [glass, glaze[0], glaze[3], clay][Math.floor(r(seed + b * 10, j) * 4)]
        k.cyl({ side: g, top: M.dark, u: u + 0.04, v: 0, y0: b + 0.035, y1: b + 0.035 + 0.14 + r(seed, j) * 0.1, r0: 0.04, r1: 0.035, seg: 6 })
        return 0.1
      },
    })
}
