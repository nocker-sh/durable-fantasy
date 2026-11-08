import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { linen, clay, glaze } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { row } from "#/world/scene/construction/helpers/furnishings/row"

export function pantry(k: Kit, wd: Wood, seed: number) {
  // jars and crocks of what was put by for the winter, a ham and a string of onions hung from the top
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const boards = [0.04, 0.5, 0.95, 1.4]
  frame({ k: k, wd: wd, h: 1.8, boards: boards })
  boards.forEach((b, i) =>
    row({
      k: k,
      y: b,
      from: -W / 2 + 0.1,
      to: W / 2 - 0.12,
      put: (u, j) => {
        const big = r(seed + i, j) > 0.6
        const rr = big ? 0.09 : 0.06
        k.cyl({
          side: big ? clay : (glaze[(i + j) % glaze.length] ?? clay),
          top: big ? M.dark : linen,
          u: u + rr,
          v: 0,
          y0: b + 0.035,
          y1: b + 0.035 + (big ? 0.3 : 0.2),
          r0: rr,
          r1: rr * 0.85,
          seg: 7,
        })
        return rr * 2 + 0.04
      },
    }),
  )
  k.box({ side: colorMat(0x8a4a3a), top: null, u0: W / 2 - 0.3, y0: 1.45, v0: D / 2 - 0.06, u1: W / 2 - 0.16, y1: 1.75, v1: D / 2 })
}
