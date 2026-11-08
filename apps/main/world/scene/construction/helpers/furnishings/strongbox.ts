import { M } from "#/world/scene/construction/materials"
import { brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function strongbox(k: Kit) {
  // iron all over, rivets in rows, a great lock
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: M.iron, top: M.iron, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.55, v1: D / 2 })
  k.box({ side: M.dark, top: null, u0: -W / 2 - 0.01, y0: 0.4, v0: -D / 2 - 0.01, u1: W / 2 + 0.01, y1: 0.42, v1: D / 2 + 0.01 })
  for (const t of [-0.3, 0, 0.3]) k.box({ side: M.stoneDark, top: null, u0: t * W - 0.03, y0: 0, v0: D / 2, u1: t * W + 0.03, y1: 0.55, v1: D / 2 + 0.01 })
  k.box({ side: brass, top: null, u0: -0.07, y0: 0.2, v0: D / 2 + 0.01, u1: 0.07, y1: 0.36, v1: D / 2 + 0.03 })
}
