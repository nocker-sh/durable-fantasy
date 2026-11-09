import type { V2 } from "#/world/scene/construction/registry"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { Rng } from "#/lib/engine/random"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { leafTex } from "#/world/scene/textures/leaves"
import { groundH } from "#/world/scene/ground-h"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
export function fieldWall(root: THREE.Group, pts: V2[], seed: number) {
  const gb = new GB()
  const r = new Rng(seed)
  const moss = mat(leafTex("moss", seed))
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i][0],
      az = pts[i][1],
      bx = pts[i + 1][0],
      bz = pts[i + 1][1]
    const len = Math.hypot(bx - ax, bz - az)
    const steps = Math.ceil(len / 0.45)
    for (let k = 0; k < steps; k++) {
      if (r.next() < 0.12) continue
      const t = k / steps
      const x = ax + (bx - ax) * t,
        z = az + (bz - az) * t
      const y = groundH(x, z)
      const h = 0.3 + r.next() * 0.3
      const w = 0.2 + r.next() * 0.06
      gb.box({
        side: r.next() < 0.5 ? M.stone : M.stoneDark,
        top: r.next() < 0.45 ? moss : M.stone,
        x0: x - w,
        y0: y - 0.2,
        z0: z - 0.22,
        x1: x + w,
        y1: y + h,
        z1: z + 0.22,
        repeat: 2,
      })
      // a stone fallen off into the grass
      if (r.next() < 0.1)
        gb.box({
          side: M.stone,
          top: M.stone,
          x0: x + 0.3,
          y0: y - 0.05,
          z0: z + 0.35,
          x1: x + 0.55,
          y1: y + 0.12,
          z1: z + 0.55,
          repeat: 1,
        })
      blockRect({
        x0: x - 0.25,
        z0: z - 0.25,
        x1: x + 0.25,
        z1: z + 0.25,
      })
    }
  }
  root.add(gb.build())
}
