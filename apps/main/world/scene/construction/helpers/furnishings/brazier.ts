import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { Kit } from "#/world/scene/construction/kit"

export function brazier(k: Kit) {
  // an iron pan of embers on three legs, for warming hands in a room without a fire
  for (const t = { value: 0 }; t.value < 3; t.value++) {
    const a = (t.value / 3) * Math.PI * 2
    k.box({ side: M.iron, top: null, u0: Math.cos(a) * 0.2 - 0.02, y0: 0, v0: Math.sin(a) * 0.2 - 0.02, u1: Math.cos(a) * 0.2 + 0.02, y1: 0.4, v1: Math.sin(a) * 0.2 + 0.02 })
  }
  k.cyl({ side: M.iron, top: null, u: 0, v: 0, y0: 0.35, y1: 0.5, r0: 0.18, r1: 0.26, seg: 10 })
  k.cyl({ side: colorMat(0xff8a3a), top: colorMat(0xff8a3a), u: 0, v: 0, y0: 0.44, y1: 0.47, r0: 0.22, r1: 0.22, seg: 10 })
  for (const t = { value: 0 }; t.value < 4; t.value++) k.box({ side: M.dark, top: null, u0: -0.12 + t.value * 0.07, y0: 0.47, v0: -0.05, u1: -0.08 + t.value * 0.07, y1: 0.5, v1: 0.05 })
}
