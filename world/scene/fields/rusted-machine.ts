import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const rustDark = colorMat(0x4a2e2a)

const rust = colorMat(0x7a4a3a)

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

export function rustedMachine(root: THREE.Group, x: number, z: number) {
  // a walking engine from the war, half sunk in the sand for two hundred years
  const gb = new GB()
  const y = groundH(x, z) - 0.6
  gb.box({ side: rust, top: rustDark, x0: x - 1.6, y0: y, z0: z - 1.0, x1: x + 1.4, y1: y + 1.6, z1: z + 1.1, repeat: 2 })
  gb.box({ side: rustDark, top: rust, x0: x - 1.0, y0: y + 1.6, z0: z - 0.7, x1: x + 0.8, y1: y + 2.3, z1: z + 0.7, repeat: 2 })
  gb.cyl({ side: rust, top: rustDark, centerX: x + 1.9, centerZ: z + 0.2, fromY: y + 0.2, toY: y + 1.4, fromRadius: 0.35, toRadius: 0.3, segments: 8, repeat: 2 })
  gb.box({ side: rustDark, top: null, x0: x - 2.6, y0: y, z0: z + 0.6, x1: x - 1.6, y1: y + 0.3, z1: z + 0.9, repeat: 2 }) // a leg, fallen
  gb.box({ side: rustDark, top: null, x0: x + 0.2, y0: y + 2.3, z0: z - 0.1, x1: x + 0.3, y1: y + 3.2, z1: z, repeat: 1 }) // a mast
  root.add(gb.build())
  blockRect({ x0: x - 1.8, z0: z - 1.2, x1: x + 2.3, z1: z + 1.3 })
}
