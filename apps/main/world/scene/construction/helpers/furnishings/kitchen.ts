import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { linen, clay } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function kitchen(k: Kit, wd: Wood, seed: number) {
  // the kitchen board: a stone sink with a jug of water, cupboards under it, a chopping board, a pot
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.body, top: null, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.82, v1: D / 2 })
  for (const t = { value: 0 }; t.value < 2; t.value++) {
    const u = -W / 2 + (t.value + 0.5) * (W / 2)
    k.box({ side: wd.dark, top: null, u0: u - W / 4 + 0.04, y0: 0.08, v0: D / 2, u1: u + W / 4 - 0.04, y1: 0.74, v1: D / 2 + 0.015 })
    k.box({ side: M.iron, top: null, u0: u - 0.02, y0: 0.5, v0: D / 2 + 0.015, u1: u + 0.02, y1: 0.56, v1: D / 2 + 0.03 })
  }
  k.box({ side: wd.top, top: wd.top, u0: -W / 2 - 0.02, y0: 0.82, v0: -D / 2, u1: W / 2 + 0.02, y1: 0.88, v1: D / 2 + 0.03 })
  k.box({ side: M.stone, top: M.stoneDark, u0: -W / 2 + 0.08, y0: 0.86, v0: -D / 2 + 0.08, u1: -W / 2 + 0.55, y1: 0.92, v1: D / 2 - 0.08 }) // the sink
  k.cyl({ side: clay, top: null, u: -W / 2 + 0.65, v: -D / 2 + 0.15, y0: 0.88, y1: 1.08, r0: 0.07, r1: 0.05 })
  k.box({ side: wd.top, top: null, u0: 0, y0: 0.88, v0: -0.1, u1: 0.35, y1: 0.91, v1: 0.15 }) // the chopping board
  k.box({ side: colorMat(0xc87a3a), top: null, u0: 0.08, y0: 0.91, v0: -0.02, u1: 0.14, y1: 0.95, v1: 0.04 })
  k.cyl({ side: M.iron, top: M.dark, u: W / 2 - 0.2, v: 0, y0: 0.88, y1: 1.02, r0: 0.12, r1: 0.13, seg: 8 })
  if (r(seed, 4) > 0.5) k.box({ side: linen, top: null, u0: -W / 2 - 0.02, y0: 0.55, v0: D / 2 + 0.03, u1: -W / 2 + 0.25, y1: 0.82, v1: D / 2 + 0.035 }) // a cloth over the edge
}
