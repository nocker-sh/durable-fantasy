import { ANVIL_GROUND_RADIUS } from "#/world/town/workshop-footprints"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"

export function anvil(gb: GB, x: number, z: number) {
  const y0 = groundH(x, z)
  gb.cyl({ side: M.woodV, top: M.wood, centerX: x, centerZ: z, fromY: y0 - 0.1, toY: y0 + 0.45, fromRadius: 0.25, toRadius: 0.23, segments: 8, repeat: 2 })
  gb.box({ side: M.iron, top: M.iron, x0: x - 0.12, y0: y0 + 0.45, z0: z - 0.1, x1: x + 0.12, y1: y0 + 0.62, z1: z + 0.1, repeat: 1 })
  gb.box({ side: M.iron, top: M.iron, x0: x - 0.32, y0: y0 + 0.62, z0: z - 0.12, x1: x + 0.25, y1: y0 + 0.74, z1: z + 0.12, repeat: 1 })
  gb.box({ side: M.iron, top: M.iron, x0: x + 0.25, y0: y0 + 0.66, z0: z - 0.06, x1: x + 0.4, y1: y0 + 0.74, z1: z + 0.06, repeat: 1 })
  blockCircle(x, z, ANVIL_GROUND_RADIUS)
}
