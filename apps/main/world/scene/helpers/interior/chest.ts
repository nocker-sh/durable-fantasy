import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

export function chest(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const xSource = f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  gb.box({ side: M.woodDark, top: M.wood, x0: x - w / 2, y0: y0, z0: z - d / 2, x1: x + w / 2, y1: y0 + 0.55, z1: z + d / 2, repeat: 2 })
  for (const t of [-0.3, 0.3]) gb.box({ side: M.iron, top: M.iron, x0: x + t * w - 0.03, y0: y0, z0: z - d / 2 - 0.01, x1: x + t * w + 0.03, y1: y0 + 0.56, z1: z + d / 2 + 0.01, repeat: 1 })
  gb.box({ side: M.iron, top: null, x0: x - 0.06, y0: y0 + 0.3, z0: z + d / 2, x1: x + 0.06, y1: y0 + 0.44, z1: z + d / 2 + 0.02, repeat: 1 })
  root.add(gb.build())
}
