import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth, paper, books, brass, wax } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function prieDieu(k: Kit, wd: Wood) {
  // a prayer desk: a kneeler at the front, a slanted desk with the book of prayers on it
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.85, v1: -D / 2 + 0.12 })
  k.box({ side: wd.top, top: wd.top, u0: -W / 2 - 0.02, y0: 0.85, v0: -D / 2, u1: W / 2 + 0.02, y1: 0.9, v1: -D / 2 + 0.3 })
  k.box({ side: wd.dark, top: cloth[0], u0: -W / 2 + 0.03, y0: 0, v0: D / 2 - 0.22, u1: W / 2 - 0.03, y1: 0.15, v1: D / 2 - 0.02 }) // kneeler
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: su * (W / 2 - 0.03) - 0.025, y0: 0, v0: -D / 2, u1: su * (W / 2 - 0.03) + 0.025, y1: 0.08, v1: D / 2 - 0.02 })
  k.box({ side: books[0], top: paper, u0: -0.14, y0: 0.9, v0: -D / 2 + 0.05, u1: 0.14, y1: 0.94, v1: -D / 2 + 0.25 })
  k.cyl({ side: brass, top: null, u: W / 2 - 0.08, v: -D / 2 + 0.06, y0: 0.9, y1: 0.92, r0: 0.04, r1: 0.04 })
  k.cyl({ side: wax, top: null, u: W / 2 - 0.08, v: -D / 2 + 0.06, y0: 0.92, y1: 1.08, r0: 0.015, r1: 0.015, seg: 6 })
}
