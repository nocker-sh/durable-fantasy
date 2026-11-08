import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { M } from "#/world/scene/construction/materials"
import type { V2 } from "#/world/scene/construction/registry"
import { Rng } from "#/lib/engine/random"
import { leafTex } from "#/world/scene/textures/leaves"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

export function ruinedWall(root: THREE.Group, pts: V2[], seed: number) {
  // a fort wall from the war, broken into stretches and grown over with moss
  const gb = new GB()
  const r = new Rng(seed)
  const moss = mat(leafTex("moss", seed))
  for (const i = { value: 0 }; i.value < pts.length - 1; i.value++) {
    const axState = pts[i.value],
      ax = axState[0],
      az = axState[1],
      bxState = pts[i.value + 1],
      bx = bxState[0],
      bz = bxState[1]
    const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.8)
    for (const k = { value: 0 }; k.value < steps; k.value++) {
      if (r.next() < 0.25) continue
      const x = ax + ((bx - ax) * k.value) / steps,
        z = az + ((bz - az) * k.value) / steps
      const h = 0.4 + r.next() * 1.6,
        y = groundH(x, z)
      gb.box({ side: M.stoneDark, top: r.next() < 0.6 ? moss : M.stone, x0: x - 0.42, y0: y - 0.3, z0: z - 0.42, x1: x + 0.42, y1: y + h, z1: z + 0.42, repeat: 2 })
      blockRect({ x0: x - 0.45, z0: z - 0.45, x1: x + 0.45, z1: z + 0.45 })
    }
  }
  root.add(gb.build())
}
