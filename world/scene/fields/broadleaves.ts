import * as THREE from "three"

const crownGeo = new THREE.IcosahedronGeometry(1, 0)

import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { trunkGeo } from "#/world/scene/fields/vegetation"

export function broadleaves(root: THREE.Group, spots: Spot[], leaf: THREE.Material = M.leaf2) {
  instanced({
    root: root,
    geo: trunkGeo,
    material: M.woodDark,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s * 1.2, s.s * 1.5, s.s * 1.2],
    ],
  })
  for (const k = { value: 0 }; k.value < 3; k.value++) {
    instanced({
      root: root,
      geo: crownGeo,
      material: leaf,
      spots: spots,
      place: (s) => {
        const a = s.r + k.value * 2.1
        return [
          [s.x + Math.cos(a) * 0.35 * s.s, groundH(s.x, s.z) + (1.6 + k.value * 0.25) * s.s, s.z + Math.sin(a) * 0.35 * s.s],
          [a, a * 2, 0],
          [0.75 * s.s, 0.65 * s.s, 0.75 * s.s],
        ]
      },
    })
  }
  for (const s of spots) blockCircle(s.x, s.z, 0.32 * s.s)
}
