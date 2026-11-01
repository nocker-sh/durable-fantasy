import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

// the hens' laying box: two straw-lined compartments on legs against the wall, an egg in one
export function nestBox(k: Kit, wd: Wood) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  for (const u of [-W / 2, -0.02, W / 2 - 0.04]) k.box({ side: wd.dark, top: wd.dark, u0: u, y0: 0, v0: -D / 2, u1: u + 0.04, y1: 0.6, v1: D / 2 })
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0.22, v0: -D / 2, u1: W / 2, y1: 0.25, v1: D / 2 })
  k.box({ side: wd.body, top: null, u0: -W / 2, y0: 0.25, v0: -D / 2, u1: W / 2, y1: 0.6, v1: -D / 2 + 0.03 })
  k.box({ side: wd.dark, top: wd.top, u0: -W / 2 - 0.02, y0: 0.6, v0: -D / 2, u1: W / 2 + 0.02, y1: 0.63, v1: D / 2 + 0.03 })
  k.box({ side: wd.body, top: wd.top, u0: -W / 2, y0: 0.25, v0: D / 2 - 0.03, u1: W / 2, y1: 0.33, v1: D / 2 })
  for (const su of [-1, 1]) k.box({ side: M.hay, top: M.hay, u0: su > 0 ? 0.02 : -W / 2 + 0.04, y0: 0.25, v0: -D / 2 + 0.03, u1: su > 0 ? W / 2 - 0.04 : -0.02, y1: 0.31, v1: D / 2 - 0.03 })
  const egg = colorMat(0xeee4cc)
  k.cyl({ side: egg, top: egg, u: W / 4, v: 0, y0: 0.31, y1: 0.36, r0: 0.025, r1: 0.02, seg: 7 })
}
