import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { glaze } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { row } from "#/world/scene/construction/helpers/furnishings/row"

export function crockery(k: Kit, wd: Wood, seed: number) {
  // a dresser of pots and bowls, the potter's own, plates stood up along the back
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const boards = [0.04, 0.55, 1.0, 1.4]
  frame({ k: k, wd: wd, h: 1.75, boards: boards })
  boards.forEach((b, i) =>
    row({
      k: k,
      y: b,
      from: -W / 2 + 0.08,
      to: W / 2 - 0.1,
      put: (u, j) => {
        const g = glaze[(i + j + Math.floor(r(seed, j) * 3)) % glaze.length]
        if (i >= 2) {
          k.box({ side: g, top: g, u0: u, y0: b + 0.035, v0: -D / 2 + 0.04, u1: u + 0.03, y1: b + 0.3, v1: -D / 2 + 0.07 }) // a plate stood up
          k.cyl({ side: g, top: null, u: u + 0.12, v: 0.05, y0: b + 0.035, y1: b + 0.11, r0: 0.06, r1: 0.09, seg: 8 }) // a bowl
          return 0.25
        }
        k.cyl({ side: g, top: M.dark, u: u + 0.1, v: 0, y0: b + 0.035, y1: b + 0.3 + r(seed, j + i) * 0.1, r0: 0.07, r1: 0.1, seg: 8 })
        return 0.24
      },
    }),
  )
}
