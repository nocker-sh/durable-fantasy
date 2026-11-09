import { M } from "#/world/scene/construction/materials"
import { Kit } from "#/world/scene/construction/kit"

export function hay(k: Kit) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: M.hay, top: M.hay, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.9, v1: D / 2, r: 1 })
  k.box({ side: M.hay, top: M.hay, u0: -W / 2 + 0.2, y0: 0.9, v0: -D / 2 + 0.2, u1: W / 2 - 0.3, y1: 1.3, v1: D / 2 - 0.25, r: 1 })
}
