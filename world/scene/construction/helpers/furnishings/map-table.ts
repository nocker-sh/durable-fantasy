import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { paper } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { diningTable } from "#/world/scene/construction/helpers/furnishings/dining-table"

export function mapTable(k: Kit, wd: Wood) {
  diningTable(k, wd, 1)
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: paper, top: paper, u0: -W / 2 + 0.12, y0: 0.765, v0: -D / 2 + 0.1, u1: W / 2 - 0.12, y1: 0.768, v1: D / 2 - 0.1 })
  k.box({ side: colorMat(0x6a8a6a), top: null, u0: -W * 0.2, y0: 0.768, v0: -D * 0.15, u1: W * 0.05, y1: 0.771, v1: D * 0.2 }) // the woods drawn on it
  k.box({ side: colorMat(0x5a7a9a), top: null, u0: W * 0.1, y0: 0.768, v0: -D * 0.35, u1: W * 0.13, y1: 0.771, v1: D * 0.35 }) // the river
  for (const entry of [
    [-W / 2 + 0.14, -D / 2 + 0.12],
    [W / 2 - 0.2, D / 2 - 0.16],
  ]) {
    const u = entry[0]
    const v = entry[1]
    k.box({ side: M.stoneDark, top: null, u0: u, y0: 0.768, v0: v, u1: u + 0.06, y1: 0.82, v1: v + 0.05 })
  }
}
