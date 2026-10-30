import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

export function press(k: Kit, wd: Wood) {
  // a cider press: a slatted basket on a tray, a beam overhead and a great wooden screw
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: wd.dark, top: wd.top, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.45, v1: D / 2 })
  k.box({ side: wd.top, top: null, u0: -W / 2 + 0.04, y0: 0.45, v0: -D / 2 + 0.04, u1: W / 2 - 0.04, y1: 0.5, v1: D / 2 - 0.04 })
  for (const t = { value: 0 }; t.value < 12; t.value++) {
    const a = (t.value / 12) * Math.PI * 2
    k.box({ side: wd.body, top: null, u0: Math.cos(a) * 0.32 - 0.03, y0: 0.5, v0: Math.sin(a) * 0.32 - 0.03, u1: Math.cos(a) * 0.32 + 0.03, y1: 0.95, v1: Math.sin(a) * 0.32 + 0.03 })
  }
  k.cyl({ side: colorMat(0x8a6a3a), top: null, u: 0, v: 0, y0: 0.5, y1: 0.85, r0: 0.3, r1: 0.3, seg: 10 })
  for (const su of [-1, 1]) k.box({ side: wd.dark, top: null, u0: su * (W / 2 - 0.08) - 0.06, y0: 0.45, v0: -0.06, u1: su * (W / 2 - 0.08) + 0.06, y1: 1.7, v1: 0.06 })
  k.box({ side: wd.dark, top: null, u0: -W / 2 + 0.02, y0: 1.55, v0: -0.08, u1: W / 2 - 0.02, y1: 1.7, v1: 0.08 })
  k.cyl({ side: wd.top, top: null, u: 0, v: 0, y0: 0.95, y1: 1.55, r0: 0.06, r1: 0.06 })
  k.box({ side: wd.top, top: null, u0: -0.4, y0: 1.05, v0: -0.03, u1: 0.4, y1: 1.1, v1: 0.03 }) // the bar to turn it
}
