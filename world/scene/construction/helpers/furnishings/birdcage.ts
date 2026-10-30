import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import type { Wood } from "#/world/scene/construction/furnishings"
import { brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function birdcage(k: Kit, wd: Wood, seed: number) {
  // a finch in a cage on a stand by the window
  k.cyl({ side: wd.dark, top: null, u: 0, v: 0, y0: 0, y1: 0.04, r0: 0.16, r1: 0.16, seg: 8 })
  k.box({ side: wd.dark, top: null, u0: -0.025, y0: 0.04, v0: -0.025, u1: 0.025, y1: 1.0, v1: 0.025 })
  k.cyl({ side: brass, top: null, u: 0, v: 0, y0: 1.0, y1: 1.02, r0: 0.17, r1: 0.17, seg: 10 })
  for (const t = { value: 0 }; t.value < 12; t.value++) {
    const a = (t.value / 12) * Math.PI * 2
    k.box({ side: brass, top: null, u0: Math.cos(a) * 0.16 - 0.006, y0: 1.02, v0: Math.sin(a) * 0.16 - 0.006, u1: Math.cos(a) * 0.16 + 0.006, y1: 1.35, v1: Math.sin(a) * 0.16 + 0.006 })
  }
  k.cyl({ side: brass, top: null, u: 0, v: 0, y0: 1.35, y1: 1.45, r0: 0.17, r1: 0.03, seg: 10 })
  k.box({ side: wd.top, top: null, u0: -0.12, y0: 1.12, v0: -0.01, u1: 0.12, y1: 1.13, v1: 0.01 })
  k.box({ side: r(seed, 1) > 0.5 ? colorMat(0xd8b040) : colorMat(0x8a6a4a), top: null, u0: -0.03, y0: 1.13, v0: -0.025, u1: 0.04, y1: 1.2, v1: 0.025 })
}
