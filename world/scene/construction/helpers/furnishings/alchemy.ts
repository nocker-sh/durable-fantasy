import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { glass, clay, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function alchemy(k: Kit, wd: Wood, seed: number) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.legs({ m: wd.dark, h: 0.82, t: 0.07, inset: 0.05 })
  k.slab({ m: wd.top, y: 0.82, t: 0.06 })
  // a little brazier, a flask over it, a still's coil, jars of what is steeping, the mortar
  k.box({ side: M.iron, top: null, u0: -W / 2 + 0.15, y0: 0.88, v0: -0.12, u1: -W / 2 + 0.4, y1: 0.98, v1: 0.12 })
  k.box({ side: colorMat(0xff8a3a), top: null, u0: -W / 2 + 0.18, y0: 0.98, v0: -0.09, u1: -W / 2 + 0.37, y1: 0.99, v1: 0.09 })
  k.cyl({ side: glass, top: null, u: -W / 2 + 0.27, v: 0, y0: 0.99, y1: 1.15, r0: 0.08, r1: 0.03 })
  k.cyl({ side: glass, top: null, u: -W / 2 + 0.27, v: 0, y0: 1.15, y1: 1.28, r0: 0.02, r1: 0.02, seg: 6 })
  k.box({ side: brass, top: null, u0: -W / 2 + 0.27, y0: 1.26, v0: -0.015, u1: W * 0.05, y1: 1.29, v1: 0.015 })
  k.cyl({ side: brass, top: null, u: W * 0.05, v: 0, y0: 0.88, y1: 1.06, r0: 0.08, r1: 0.08 })
  for (const t = { value: 0 }; t.value < 4; t.value++)
    k.cyl({ side: t.value % 2 ? glass : clay, top: null, u: W * 0.2 + t.value * 0.12, v: -D / 2 + 0.12, y0: 0.88, y1: 0.98 + r(seed, t.value) * 0.08, r0: 0.045, r1: 0.04, seg: 6 })
  k.cyl({ side: M.stone, top: null, u: W / 2 - 0.15, v: D * 0.15, y0: 0.88, y1: 0.96, r0: 0.07, r1: 0.06 })
}
