import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import type { Wood } from "#/world/scene/construction/furnishings"
import { willow } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function breadRack(k: Kit, wd: Wood, seed: number) {
  // two tiers of long baskets, loaves in them
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  k.legs({ m: wd.dark, h: 0.85, t: 0.04, inset: 0.02 })
  for (const y of [0.3, 0.75]) {
    k.box({ side: willow, top: null, u0: -W / 2 + 0.04, y0: y, v0: -D / 2 + 0.04, u1: W / 2 - 0.04, y1: y + 0.1, v1: D / 2 - 0.04 })
    for (const t = { value: 0 }; t.value < Math.floor(W / 0.16); t.value++)
      k.cyl({
        side: colorMat(t.value % 3 ? 0x7a5236 : 0xc89a5a),
        top: null,
        u: -W / 2 + 0.12 + t.value * 0.16,
        v: (r(seed, t.value) - 0.5) * 0.1,
        y0: y + 0.08,
        y1: y + 0.16,
        r0: 0.07,
        r1: 0.05,
        seg: 6,
      })
  }
}
