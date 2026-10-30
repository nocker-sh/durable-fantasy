import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

export function dryingRack(root: THREE.Group, x: number, z: number) {
  // fish split and hung to dry in the cold wind
  const gb = new GB()
  const y = groundH(x, z)
  for (const dx of [-1.1, 1.1]) gb.box({ side: M.woodDark, top: null, x0: x + dx - 0.05, y0: y, z0: z - 0.05, x1: x + dx + 0.05, y1: y + 1.5, z1: z + 0.05, repeat: 2 })
  gb.box({ side: M.woodDark, top: null, x0: x - 1.2, y0: y + 1.42, z0: z - 0.04, x1: x + 1.2, y1: y + 1.5, z1: z + 0.04, repeat: 2 })
  const fish = colorMat(0x9aa4a8)
  for (const k = { value: 0 }; k.value < 7; k.value++)
    gb.box({ side: fish, top: null, x0: x - 1 + k.value * 0.33 - 0.06, y0: y + 0.95, z0: z - 0.02, x1: x - 1 + k.value * 0.33 + 0.06, y1: y + 1.4, z1: z + 0.02, repeat: 1 })
  root.add(gb.build())
  blockRect({ x0: x - 1.25, z0: z - 0.3, x1: x + 1.25, z1: z + 0.3 })
}
