import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

export function choppingBlock(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  gb.cyl({ side: M.woodV, top: M.wood, centerX: x, centerZ: z, fromY: y - 0.05, toY: y + 0.42, fromRadius: 0.24, toRadius: 0.26, segments: 8, repeat: 1 })
  gb.box({ side: M.iron, top: null, x0: x - 0.02, y0: y + 0.42, z0: z - 0.12, x1: x + 0.02, y1: y + 0.52, z1: z + 0.08, repeat: 1 })
  gb.box({ side: M.woodDark, top: null, x0: x - 0.02, y0: y + 0.5, z0: z + 0.04, x1: x + 0.02, y1: y + 0.85, z1: z + 0.08, repeat: 1 })
  blockCircle(x, z, 0.3)
}
