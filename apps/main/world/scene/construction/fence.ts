import { drawFenceRail } from "#/world/scene/construction/draw-fence-rail"
import { FENCE_GAP_RADIUS } from "#/world/town/fence-gap-radius"
import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { hash2 } from "#/lib/engine/hash2"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import type { V2 } from "#/world/scene/construction/registry"

type Props = {
  root: THREE.Group
  pts: V2[]
  gaps?: V2[]
  h?: number
}

export function fence(props: Props) {
  const gaps = props.gaps === undefined ? [] : props.gaps
  const h = props.h === undefined ? 0.7 : props.h

  const gb = new GB()
  for (const i = { value: 0 }; i.value < props.pts.length - 1; i.value++) {
    const axState = props.pts[i.value],
      ax = axState[0],
      az = axState[1],
      bxState = props.pts[i.value + 1],
      bx = bxState[0],
      bz = bxState[1]
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(L / 0.9))
    for (const k = { value: 0 }; k.value <= n; k.value++) {
      const x = ax + ((bx - ax) * k.value) / n,
        z = az + ((bz - az) * k.value) / n
      const gapHere = gaps.some((entry) => {
        const gx = entry[0]
        const gz = entry[1]
        return Math.hypot(gx - x, gz - z) < FENCE_GAP_RADIUS
      })
      const y = groundH(x, z)
      if (!gapHere)
        gb.box({
          side: hash2(k.value, i.value, 3) > 0.7 ? M.woodDark : M.woodV,
          top: M.woodDark,
          x0: x - 0.05,
          y0: y - 0.2,
          z0: z - 0.05,
          x1: x + 0.05,
          y1: y + h + (hash2(k.value, i.value, 1) - 0.5) * 0.16,
          z1: z + 0.05,
          repeat: 2,
        })
      if (k.value < n) {
        const x2 = ax + ((bx - ax) * (k.value + 1)) / n,
          z2 = az + ((bz - az) * (k.value + 1)) / n
        const gap2 = gaps.some((entry2) => {
          const gx = entry2[0]
          const gz = entry2[1]
          return Math.hypot(gx - (x + x2) / 2, gz - (z + z2) / 2) < FENCE_GAP_RADIUS
        })
        if (gap2) continue
        const y2 = groundH(x2, z2)
        // old fences: here a rail gone, there one broken off short or sagging, some boards darker with age
        const wear = hash2(k.value, i.value, 7)
        for (const entry3 of [
          [0, h * 0.45],
          [1, h * 0.85],
        ] as const) {
          const r = entry3[0]
          const hh0 = entry3[1]

          if (wear > 0.9 && r === 1) continue // the top rail gone
          const broken = wear > 0.82 && wear <= 0.9 && r === 0
          const end = broken ? 0.45 : 1
          const sag = wear < 0.08 ? -0.07 : 0
          const ex = x + (x2 - x) * end,
            ez = z + (z2 - z) * end,
            ey = y + (y2 - y) * end
          const rm = hash2(k.value, i.value * 3 + r, 9) > 0.65 ? M.woodDark : M.wood
          drawFenceRail({ gb, material: rm, from: [x, y + hh0, z], to: [ex, ey + hh0 + sag, ez], gaps })
        }
        for (const s = { value: 0 }; s.value <= 6; s.value++) {
          const t = s.value / 6,
            fx = x + (x2 - x) * t,
            fz = z + (z2 - z) * t
          const gh = gaps.some((entry4) => {
            const gx = entry4[0]
            const gz = entry4[1]
            return Math.hypot(gx - fx, gz - fz) < FENCE_GAP_RADIUS
          })
          if (!gh) blockCircle(fx, fz, 0.2)
        }
      }
    }
  }
  props.root.add(gb.build())
}
