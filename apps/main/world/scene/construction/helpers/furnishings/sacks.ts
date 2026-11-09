import { flourSack, flourDust, grainMat } from "#/world/scene/construction/furnishings"
import { charcoal } from "#/world/scene/construction/furnishings"
import { M } from "#/world/scene/construction/materials"
import { ash } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

export function sacks(k: Kit, seed: number, what: "wool" | "ash" | "flour" | "grain" | "charcoal") {
  if (what === "charcoal") {
    // straw bales of charcoal, lumps showing at the open tops, black dust on the floor
    const n = Math.max(1, Math.round(k.W / 0.34))
    for (let t = 0; t < n; t++) {
      const u = -k.W / 2 + (t + 0.5) * (k.W / n)
      const h = 0.5 + r(seed, t) * 0.12
      k.cyl({
        side: M.hay,
        top: M.hay,
        u: u,
        v: 0,
        y0: 0,
        y1: h,
        r0: 0.15,
        r1: 0.16,
        seg: 7,
      })
      for (const y of [0.15, h - 0.12])
        k.cyl({
          side: M.rope,
          top: null,
          u: u,
          v: 0,
          y0: y,
          y1: y + 0.04,
          r0: 0.165,
          r1: 0.165,
          seg: 7,
        })
      for (let q = 0; q < 3; q++)
        k.box({
          side: charcoal,
          top: null,
          u0: u - 0.08 + q * 0.05,
          y0: h,
          v0: -0.04 + (q % 2) * 0.05,
          u1: u - 0.04 + q * 0.05,
          y1: h + 0.05,
          v1: 0.0 + (q % 2) * 0.05,
        })
    }
    k.box({
      side: charcoal,
      top: null,
      u0: -k.W / 2,
      y0: 0,
      v0: k.D / 2 - 0.12,
      u1: k.W / 2 - 0.1,
      y1: 0.005,
      v1: k.D / 2,
    })
    return
  }
  // flour and grain stacked two deep, a smaller layer laid across the top
  const n = Math.max(1, Math.round(k.W / 0.4))
  const layers = what === "flour" || what === "grain" ? 2 : 1
  for (let l = 0; l < layers; l++)
    for (let t = 0; t < n - l; t++) {
      const u = -k.W / 2 + (t + 0.5 + l * 0.5) * (k.W / n)
      const y = l * 0.42
      const h = 0.45 + r(seed, t + l * 7) * 0.15
      const m = what === "wool" ? M.wool : what === "flour" ? flourSack : M.sack
      k.cyl({
        side: m,
        top: m,
        u: u,
        v: 0,
        y0: y,
        y1: y + h * 0.75,
        r0: 0.17,
        r1: 0.19,
        seg: 7,
      })
      k.cyl({
        side: m,
        top: m,
        u: u,
        v: 0,
        y0: y + h * 0.75,
        y1: y + h,
        r0: 0.19,
        r1: 0.07,
        seg: 7,
      })
      k.cyl({
        side: M.rope,
        top: null,
        u: u,
        v: 0,
        y0: y + h - 0.06,
        y1: y + h - 0.02,
        r0: 0.08,
        r1: 0.08,
        seg: 6,
      })
      if (what === "ash")
        k.cyl({
          side: ash,
          top: null,
          u: u + 0.2,
          v: 0.05,
          y0: 0,
          y1: 0.03,
          r0: 0.08,
          r1: 0.04,
          seg: 6,
        })
      if (what === "grain" && l === 0 && t === 0)
        k.cyl({
          side: grainMat,
          top: null,
          u: u + 0.22,
          v: 0.08,
          y0: 0,
          y1: 0.04,
          r0: 0.1,
          r1: 0.05,
          seg: 6,
        }) // spilt from a seam
    }
  if (what === "flour")
    k.box({
      side: flourDust,
      top: null,
      u0: -k.W / 2,
      y0: 0,
      v0: -k.D / 2,
      u1: k.W / 2,
      y1: 0.004,
      v1: k.D / 2 + 0.1,
    })
}
