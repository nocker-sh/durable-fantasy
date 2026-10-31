import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { linen } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import type { Wood } from "#/world/scene/construction/furnishings"
import { row } from "#/world/scene/construction/helpers/furnishings/row"
import { cheese } from "#/world/scene/construction/furnishings"
export function cheeseShelf(k: Kit, wd: Wood, seed: number) {
  // wheels of cheese turned on the boards to ripen, the youngest palest, a cloth over the top row
  const { W } = k
  const boards = [0.04, 0.45, 0.85, 1.25]
  frame({
    k: k,
    wd: wd,
    h: 1.6,
    boards: boards,
    back: false,
  })
  boards.forEach((b, i) =>
    row({
      k: k,
      y: b,
      from: -W / 2 + 0.08,
      to: W / 2 - 0.1,
      put: (u) => {
        const rr = 0.11 + r(seed + i, Math.round(u * 10)) * 0.03
        k.cyl({
          side: i === 3 ? linen : cheese[i % cheese.length],
          top: cheese[i % cheese.length],
          u: u + rr,
          v: 0,
          y0: b + 0.035,
          y1: b + 0.035 + 0.1,
          r0: rr,
          r1: rr,
          seg: 10,
        })
        return rr * 2 + 0.05
      },
    }),
  )
}
