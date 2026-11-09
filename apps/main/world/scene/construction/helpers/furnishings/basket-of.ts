import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { cloth, willow } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

// ---------------------------------------------------------------- baskets, bundles and racks

export function basketOf(k: Kit, seed: number, what: "veg" | "fruit" | "yarn" | "unfinished") {
  const rr = Math.min(k.W, k.D) / 2 - 0.04
  const h = what === "unfinished" ? 0.25 : 0.35
  k.cyl({ side: willow, top: null, u: 0, v: 0, y0: 0, y1: h, r0: rr * 0.8, r1: rr, seg: 9 })
  if (what === "unfinished") {
    for (const t = { value: 0 }; t.value < 12; t.value++) {
      const a = (t.value / 12) * Math.PI * 2
      k.box({ side: willow, top: null, u0: Math.cos(a) * rr - 0.008, y0: h, v0: Math.sin(a) * rr - 0.008, u1: Math.cos(a) * rr * 1.1 + 0.008, y1: h + 0.35, v1: Math.sin(a) * rr * 1.1 + 0.008 })
    }
    return
  }
  const colours = what === "veg" ? [colorMat(0xc87a3a), colorMat(0x6a8a4a), colorMat(0xd8c8a8)] : what === "fruit" ? [colorMat(0xa83a3a), colorMat(0x8aa83a), colorMat(0x6a3a6a)] : cloth.slice(0, 4)
  for (const t = { value: 0 }; t.value < 7; t.value++) {
    const a = r(seed, t.value) * Math.PI * 2,
      d = r(seed, t.value + 7) * rr * 0.6
    const s = what === "yarn" ? 0.07 : 0.055
    k.cyl({ side: colours[t.value % colours.length], top: colours[t.value % colours.length], u: Math.cos(a) * d, v: Math.sin(a) * d, y0: h - 0.04, y1: h + s, r0: s, r1: s * 0.7, seg: 6 })
  }
}
