import type { Wood } from "#/world/scene/construction/furnishings"
import { paper, books } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"
import { frame } from "#/world/scene/construction/helpers/furnishings/frame"
import { row } from "#/world/scene/construction/helpers/furnishings/row"

export function bookcase(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const boards = [0.04, 0.45, 0.85, 1.25]
  frame({ k: k, wd: wd, h: 1.65, boards: boards })
  boards.forEach((b, i) =>
    row({
      k: k,
      y: b,
      from: -W / 2 + 0.06,
      to: W / 2 - 0.12,
      put: (u, j) => {
        const n = r(seed + i * 7, j)
        if (n > 0.9 && j > 0) return 0.12 // a gap
        const t = 0.04 + n * 0.04,
          hh = 0.26 + r(seed, i * 13 + j) * 0.1
        // now and then one lies on its side
        if (n < 0.06) k.box({ side: books[j % books.length], top: books[j % books.length], u0: u, y0: b + 0.035, v0: -D / 2 + 0.05, u1: u + hh, y1: b + 0.035 + t, v1: D / 2 - 0.05 })
        else k.box({ side: books[(j + i) % books.length], top: paper, u0: u, y0: b + 0.035, v0: -D / 2 + 0.05, u1: u + t, y1: b + 0.035 + hh, v1: D / 2 - 0.04 })
        return n < 0.06 ? hh + 0.01 : t + 0.005
      },
    }),
  )
}
