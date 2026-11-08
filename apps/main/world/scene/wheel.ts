import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

export function wheel(gb: GB, x: number, z: number) {
  // a spare cart wheel leant against the wall
  const y = groundH(x, z)
  gb.cyl({ side: M.woodDark, top: M.wood, centerX: x, centerZ: z, fromY: y + 0.02, toY: y + 0.1, fromRadius: 0.42, toRadius: 0.42, segments: 10, repeat: 1 })
  blockCircle(x, z, 0.3)
}
