import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

export function workbench(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const xSource = f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  gb.box({ side: M.wood, top: M.wood, x0: x - w / 2, y0: y0 + 0.74, z0: z - d / 2, x1: x + w / 2, y1: y0 + 0.82, z1: z + d / 2, repeat: 2 })
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      gb.box({
        side: M.woodDark,
        top: null,
        x0: x + sx * (w / 2 - 0.08) - 0.05,
        y0: y0,
        z0: z + sz * (d / 2 - 0.08) - 0.05,
        x1: x + sx * (w / 2 - 0.08) + 0.05,
        y1: y0 + 0.74,
        z1: z + sz * (d / 2 - 0.08) + 0.05,
        repeat: 2,
      })
  gb.box({ side: M.woodDark, top: null, x0: x - w / 2 + 0.1, y0: y0 + 0.2, z0: z - d / 2 + 0.1, x1: x + w / 2 - 0.1, y1: y0 + 0.25, z1: z + d / 2 - 0.1, repeat: 2 })
  // tools on top
  gb.box({ side: M.iron, top: null, x0: x - 0.1, y0: y0 + 0.82, z0: z - 0.3, x1: x + 0.1, y1: y0 + 0.86, z1: z + 0.1, repeat: 1 })
  gb.box({ side: M.woodV, top: null, x0: x - 0.2, y0: y0 + 0.82, z0: z + 0.25, x1: x + 0.15, y1: y0 + 0.9, z1: z + 0.4, repeat: 1 })
  root.add(gb.build())
}
