import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const greyWood = colorMat(0x6a625e)

import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { trunkGeo } from "#/world/scene/fields/vegetation"

export function deadTrees(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: trunkGeo,
    material: greyWood,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0.05, s.r, 0.04],
      [s.s * 1.1, s.s * 2.2, s.s * 1.1],
    ],
  })
  instanced({
    root: root,
    geo: trunkGeo,
    material: greyWood,
    spots: spots,
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 1.2 * s.s, s.z],
      [0.9, s.r, 0.3],
      [s.s * 0.6, s.s * 0.9, s.s * 0.6],
    ],
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.25 * s.s)
}
