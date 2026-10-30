import { M } from "#/world/scene/construction/materials"
import { ash } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function sacks(k: Kit, seed: number, what: "wool" | "ash") {
  const n = Math.max(1, Math.round(k.W / 0.4))
  for (const t = { value: 0 }; t.value < n; t.value++) {
    const u = -k.W / 2 + (t.value + 0.5) * (k.W / n)
    const h = 0.45 + r(seed, t.value) * 0.15
    const m = what === "wool" ? M.wool : M.sack
    k.cyl({ side: m, top: m, u: u, v: 0, y0: 0, y1: h * 0.75, r0: 0.17, r1: 0.19, seg: 7 })
    k.cyl({ side: m, top: m, u: u, v: 0, y0: h * 0.75, y1: h, r0: 0.19, r1: 0.07, seg: 7 })
    k.cyl({ side: M.rope, top: null, u: u, v: 0, y0: h - 0.06, y1: h - 0.02, r0: 0.08, r1: 0.08, seg: 6 })
    if (what === "ash") k.cyl({ side: ash, top: null, u: u + 0.2, v: 0.05, y0: 0, y1: 0.03, r0: 0.08, r1: 0.04, seg: 6 })
  }
}
