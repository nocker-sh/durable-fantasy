import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const hide = colorMat(0x8a6a4a)
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

export function hideFrame(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  gb.box({ side: M.woodDark, top: null, x0: x - 0.5, y0: y, z0: z - 0.04, x1: x - 0.44, y1: y + 1.3, z1: z + 0.04, repeat: 2 })
  gb.box({ side: M.woodDark, top: null, x0: x + 0.44, y0: y, z0: z - 0.04, x1: x + 0.5, y1: y + 1.3, z1: z + 0.04, repeat: 2 })
  gb.box({ side: M.woodDark, top: null, x0: x - 0.5, y0: y + 1.24, z0: z - 0.04, x1: x + 0.5, y1: y + 1.3, z1: z + 0.04, repeat: 2 })
  gb.box({ side: hide, top: null, x0: x - 0.4, y0: y + 0.35, z0: z - 0.015, x1: x + 0.4, y1: y + 1.2, z1: z + 0.015, repeat: 1 })
  blockRect({ x0: x - 0.55, z0: z - 0.2, x1: x + 0.55, z1: z + 0.2 })
}
