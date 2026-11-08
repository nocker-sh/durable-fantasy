import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

export function spearRack(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  gb.box({ side: M.woodDark, top: null, x0: x - 0.5, y0: y + 0.9, z0: z - 0.04, x1: x + 0.5, y1: y + 0.98, z1: z + 0.04, repeat: 2 })
  for (const k = { value: 0 }; k.value < 4; k.value++) {
    const sx = x - 0.36 + k.value * 0.24
    gb.box({ side: M.woodDark, top: null, x0: sx - 0.02, y0: y, z0: z - 0.02, x1: sx + 0.02, y1: y + 1.7, z1: z + 0.02, repeat: 1 })
    gb.box({ side: M.iron, top: null, x0: sx - 0.03, y0: y + 1.7, z0: z - 0.03, x1: sx + 0.03, y1: y + 1.9, z1: z + 0.03, repeat: 1 })
  }
  blockRect({ x0: x - 0.55, z0: z - 0.2, x1: x + 0.55, z1: z + 0.2 })
}
