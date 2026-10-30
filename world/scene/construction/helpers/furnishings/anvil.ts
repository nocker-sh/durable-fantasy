import { M } from "#/world/scene/construction/materials"

import { Kit } from "#/world/scene/construction/kit"

export function anvil(k: Kit) {
  // a smith's anvil on its stump
  k.cyl({ side: M.woodDark, top: M.wood, u: 0, v: 0, y0: 0, y1: 0.5, r0: 0.25, r1: 0.27, seg: 9 })
  k.box({ side: M.iron, top: M.iron, u0: -0.12, y0: 0.5, v0: -0.1, u1: 0.12, y1: 0.62, v1: 0.1 })
  k.box({ side: M.iron, top: M.iron, u0: -0.28, y0: 0.62, v0: -0.09, u1: 0.22, y1: 0.76, v1: 0.09 })
  k.box({ side: M.iron, top: M.iron, u0: 0.22, y0: 0.66, v0: -0.05, u1: 0.36, y1: 0.74, v1: 0.05 }) // the horn
}
