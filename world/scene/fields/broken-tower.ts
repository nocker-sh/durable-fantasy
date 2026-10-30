import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import { rocks } from "#/world/scene/fields/rocks"

export function brokenTower(root: THREE.Group, x: number, z: number) {
  // an old watchtower on the cliff, its top long fallen
  const gb = new GB()
  const y = groundH(x, z)
  gb.cyl({ side: M.ashlar, top: M.stone, centerX: x, centerZ: z, fromY: y - 0.4, toY: y + 3.6, fromRadius: 1.2, toRadius: 1.05, segments: 10, repeat: 2 })
  gb.cyl({ side: M.ashlar, top: null, centerX: x + 0.3, centerZ: z, fromY: y + 3.6, toY: y + 4.5, fromRadius: 0.9, toRadius: 0.7, segments: 7, repeat: 2 })
  gb.box({ side: M.dark, top: null, x0: x - 0.3, y0: y, z0: z + 1.1, x1: x + 0.3, y1: y + 1.3, z1: z + 1.2, repeat: 1 })
  root.add(gb.build())
  rocks(root, [
    { x: x + 1.8, z: z + 0.6, s: 0.7, r: 1 },
    { x: x - 1.6, z: z + 1.2, s: 0.5, r: 2 },
    { x: x + 0.8, z: z - 1.8, s: 0.6, r: 3 },
  ])
  blockCircle(x, z, 1.4)
}
