import { M } from "#/world/scene/construction/materials"

import { Kit } from "#/world/scene/construction/kit"

export function beehive(k: Kit) {
  // a straw skep on a little stand
  k.box({ side: M.woodDark, top: M.wood, u0: -0.25, y0: 0, v0: -0.2, u1: 0.25, y1: 0.4, v1: 0.2 })
  for (const t = { value: 0 }; t.value < 4; t.value++)
    k.cyl({ side: M.thatch, top: null, u: 0, v: 0, y0: 0.4 + t.value * 0.1, y1: 0.5 + t.value * 0.1, r0: 0.22 - t.value * 0.04, r1: 0.2 - t.value * 0.05, seg: 9 })
  k.box({ side: M.dark, top: null, u0: -0.04, y0: 0.4, v0: 0.17, u1: 0.04, y1: 0.45, v1: 0.2 })
}
