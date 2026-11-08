import { INTERIOR_CLOTH as cloth } from "#/world/scene/construction/interior-cloth-materials"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

export function loom(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const xSource = f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      gb.box({
        side: M.woodDark,
        top: null,
        x0: x + sx * (w / 2 - 0.05) - 0.04,
        y0: y0,
        z0: z + sz * (d / 2 - 0.05) - 0.04,
        x1: x + sx * (w / 2 - 0.05) + 0.04,
        y1: y0 + 1.3,
        z1: z + sz * (d / 2 - 0.05) + 0.04,
        repeat: 2,
      })
  gb.box({ side: M.woodDark, top: null, x0: x - w / 2, y0: y0 + 1.25, z0: z - d / 2, x1: x + w / 2, y1: y0 + 1.32, z1: z + d / 2, repeat: 2 })
  gb.box({ side: cloth[2], top: null, x0: x - w / 2 + 0.1, y0: y0 + 0.62, z0: z - 0.05, x1: x + w / 2 - 0.1, y1: y0 + 1.2, z1: z + 0.02, repeat: 1 })
  gb.box({ side: M.wood, top: M.wood, x0: x - w / 2 + 0.05, y0: y0 + 0.6, z0: z - d / 2 + 0.05, x1: x + w / 2 - 0.05, y1: y0 + 0.66, z1: z + d / 2 - 0.05, repeat: 2 })
  root.add(gb.build())
}
