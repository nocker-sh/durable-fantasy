import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { row } from "#/world/scene/construction/helpers/furnishings/row"

export function toolShelf(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const boards = [0.04, 0.6, 1.15]
  frame({ k: k, wd: wd, h: 1.6, boards: boards })
  boards.forEach((b, i) =>
    row({
      k: k,
      y: b,
      from: -W / 2 + 0.08,
      to: W / 2 - 0.1,
      put: (u, j) => {
        const n = r(seed + i * 3, j)
        if (n < 0.3) k.box({ side: wd.dark, top: M.iron, u0: u, y0: b + 0.035, v0: -D / 2 + 0.06, u1: u + 0.28, y1: b + 0.12, v1: D / 2 - 0.06 }) // a tool box
        else if (n < 0.6) k.cyl({ side: M.iron, top: M.dark, u: u + 0.08, v: 0, y0: b + 0.035, y1: b + 0.2, r0: 0.08, r1: 0.08, seg: 7 }) // a pot of nails
        else k.box({ side: M.rope, top: null, u0: u, y0: b + 0.035, v0: -0.08, u1: u + 0.2, y1: b + 0.13, v1: 0.08 }) // a coil of cord
        return n < 0.3 ? 0.32 : 0.22
      },
    }),
  )
}
