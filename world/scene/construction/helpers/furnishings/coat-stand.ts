import type { Wood } from "#/world/scene/construction/furnishings"
import { cloth } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function coatStand(k: Kit, wd: Wood, seed: number) {
  k.box({ side: wd.dark, top: null, u0: -0.18, y0: 0, v0: -0.03, u1: 0.18, y1: 0.05, v1: 0.03 })
  k.box({ side: wd.dark, top: null, u0: -0.03, y0: 0, v0: -0.18, u1: 0.03, y1: 0.05, v1: 0.18 })
  k.box({ side: wd.body, top: null, u0: -0.03, y0: 0.05, v0: -0.03, u1: 0.03, y1: 1.7, v1: 0.03 })
  for (const t = { value: 0 }; t.value < 4; t.value++) {
    const a = (t.value / 4) * Math.PI * 2
    k.box({ side: wd.dark, top: null, u0: Math.cos(a) * 0.12 - 0.015, y0: 1.55, v0: Math.sin(a) * 0.12 - 0.015, u1: Math.cos(a) * 0.12 + 0.015, y1: 1.6, v1: Math.sin(a) * 0.12 + 0.015 })
  }
  // a coat, a hat, a scarf left on it
  const c = cloth[Math.floor(r(seed, 1) * cloth.length)]
  k.box({ side: c, top: null, u0: 0.03, y0: 0.75, v0: -0.12, u1: 0.13, y1: 1.55, v1: 0.12 })
  k.cyl({ side: cloth[Math.floor(r(seed, 2) * cloth.length)], top: null, u: -0.1, v: 0, y0: 1.6, y1: 1.68, r0: 0.1, r1: 0.08, seg: 7 })
  if (r(seed, 3) > 0.4) k.box({ side: cloth[0], top: null, u0: -0.09, y0: 1.0, v0: -0.03, u1: -0.05, y1: 1.55, v1: 0.03 })
}
