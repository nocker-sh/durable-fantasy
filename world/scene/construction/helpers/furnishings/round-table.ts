import type { Wood } from "#/world/scene/construction/furnishings"
import { clay } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function roundTable(k: Kit, wd: Wood) {
  const rr = Math.min(k.W, k.D) / 2
  k.cyl({ side: wd.dark, top: null, u: 0, v: 0, y0: 0, y1: 0.06, r0: rr * 0.5, r1: rr * 0.45 })
  k.cyl({ side: wd.dark, top: null, u: 0, v: 0, y0: 0.06, y1: 0.68, r0: 0.06, r1: 0.06 })
  k.cyl({ side: wd.body, top: wd.top, u: 0, v: 0, y0: 0.68, y1: 0.74, r0: rr, r1: rr, seg: 12 })
  k.cyl({ side: clay, top: null, u: rr * 0.3, v: 0, y0: 0.74, y1: 0.86, r0: 0.05, r1: 0.04 })
}
