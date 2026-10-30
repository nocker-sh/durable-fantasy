import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function armorStand(k: Kit, wd: Wood, seed: number) {
  // a cross on a post with a mail shirt over it and a helm on top
  k.box({ side: wd.dark, top: wd.dark, u0: -0.2, y0: 0, v0: -0.15, u1: 0.2, y1: 0.06, v1: 0.15 })
  k.box({ side: wd.dark, top: null, u0: -0.03, y0: 0.06, v0: -0.03, u1: 0.03, y1: 1.55, v1: 0.03 })
  k.box({ side: wd.dark, top: null, u0: -0.25, y0: 1.35, v0: -0.03, u1: 0.25, y1: 1.4, v1: 0.03 })
  k.box({ side: r(seed, 1) > 0.5 ? M.iron : colorMat(0x6a4632), top: null, u0: -0.22, y0: 0.75, v0: -0.12, u1: 0.22, y1: 1.4, v1: 0.12 })
  k.cyl({ side: M.iron, top: M.iron, u: 0, v: 0, y0: 1.45, y1: 1.65, r0: 0.11, r1: 0.09, seg: 8 })
}
