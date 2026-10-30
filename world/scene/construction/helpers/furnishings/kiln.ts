import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { Kit } from "#/world/scene/construction/kit"

export function kiln(k: Kit) {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.box({ side: M.stoneDark, top: M.stone, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 1.1, v1: D / 2, r: 2 })
  k.cyl({ side: M.stone, top: null, u: 0, v: -0.1, y0: 1.1, y1: 1.5, r0: Math.min(W, D) * 0.4, r1: Math.min(W, D) * 0.25, seg: 10 })
  k.box({ side: M.dark, top: null, u0: -0.25, y0: 0.1, v0: D / 2, u1: 0.25, y1: 0.55, v1: D / 2 + 0.01 })
  k.box({ side: colorMat(0xff8a3a), top: null, u0: -0.18, y0: 0.1, v0: D / 2 + 0.01, u1: 0.18, y1: 0.25, v1: D / 2 + 0.015 })
}
