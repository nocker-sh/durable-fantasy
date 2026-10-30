import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function perch(k: Kit, wd: Wood) {
  const WSource = k,
    W = WSource.W
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: su * (W / 2 - 0.04) - 0.03, y0: 0, v0: -0.03, u1: su * (W / 2 - 0.04) + 0.03, y1: 0.9, v1: 0.03 })
  for (const y of [0.45, 0.85]) k.box({ side: wd.body, top: null, u0: -W / 2, y0: y, v0: -0.025, u1: W / 2, y1: y + 0.04, v1: 0.025 })
  k.box({ side: M.hay, top: null, u0: -W / 2, y0: 0, v0: -0.18, u1: W / 2, y1: 0.03, v1: 0.18 })
}
