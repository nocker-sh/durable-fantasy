import { M } from "#/world/scene/construction/materials"

import { willow } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function bundles(k: Kit, seed: number, what: "willow" | "timber" | "logs") {
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  if (what === "willow") {
    for (const t = { value: 0 }; t.value < 3; t.value++) {
      const u = -W / 2 + 0.17 + t.value * ((W - 0.34) / 2)
      for (const s = { value: 0 }; s.value < 6; s.value++)
        k.box({
          side: willow,
          top: null,
          u0: u - 0.06 + s.value * 0.02,
          y0: 0,
          v0: -0.06 + (s.value % 3) * 0.04,
          u1: u - 0.05 + s.value * 0.02,
          y1: 1.2 + r(seed, s.value) * 0.2,
          v1: -0.05 + (s.value % 3) * 0.04,
        })
      k.cyl({ side: M.rope, top: null, u: u, v: 0, y0: 0.5, y1: 0.55, r0: 0.08, r1: 0.08, seg: 6 })
    }
    return
  }
  const L = W - 0.05
  const layers = what === "timber" ? 4 : 3
  for (const l = { value: 0 }; l.value < layers; l.value++) {
    const across = Math.floor((D - 0.05) / (what === "timber" ? 0.2 : 0.16))
    for (const t = { value: 0 }; t.value < across - (what === "logs" ? l.value : 0); t.value++) {
      const v = -D / 2 + 0.05 + t.value * (what === "timber" ? 0.2 : 0.16) + (what === "logs" ? l.value * 0.08 : 0)
      const y = l.value * (what === "timber" ? 0.08 : 0.14)
      if (what === "timber")
        k.box({ side: M.wood, top: M.wood, u0: -L / 2 + r(seed, t.value + l.value) * 0.1, y0: y, v0: v, u1: L / 2 - r(seed, t.value * 3 + l.value) * 0.1, y1: y + 0.07, v1: v + 0.18 })
      else k.box({ side: M.woodV, top: M.woodDark, u0: -L / 2, y0: y, v0: v, u1: L / 2, y1: y + 0.14, v1: v + 0.14 })
    }
  }
}
