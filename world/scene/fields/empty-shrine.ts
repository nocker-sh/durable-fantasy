import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

export function emptyShrine(root: THREE.Group, x: number, z: number) {
  // an altar nobody tends any more, from when the goddess was here
  const gb = new GB()
  const y = groundH(x, z)
  gb.box({ side: M.stoneDark, top: M.stone, x0: x - 1.2, y0: y - 0.2, z0: z - 0.8, x1: x + 1.2, y1: y + 0.3, z1: z + 0.8, repeat: 2 })
  gb.box({ side: M.ashlar, top: M.stone, x0: x - 0.5, y0: y + 0.3, z0: z - 0.4, x1: x + 0.5, y1: y + 1.1, z1: z + 0.4, repeat: 2 })
  for (const dx of [-1.0, 1.0]) gb.box({ side: M.ashlar, top: M.stone, x0: x + dx - 0.18, y0: y + 0.3, z0: z - 0.18, x1: x + dx + 0.18, y1: y + (dx < 0 ? 2.2 : 1.3), z1: z + 0.18, repeat: 2 })
  root.add(gb.build())
  blockRect({ x0: x - 1.3, z0: z - 0.9, x1: x + 1.3, z1: z + 0.9 })
}
