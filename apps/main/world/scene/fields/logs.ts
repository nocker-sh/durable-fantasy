import * as THREE from "three"

const logGeo = new THREE.CylinderGeometry(0.18, 0.21, 1, 7).rotateZ(Math.PI / 2)

import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

export function logs(root: THREE.Group, spots: Spot[], material: THREE.Material = M.woodDark) {
  instanced({
    root: root,
    geo: logGeo,
    material: material,
    spots: spots,
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 0.16, s.z],
      [0, s.r, 0],
      [s.s * 2.4, 1, 1],
    ],
  })
  for (const s of spots) for (const t = { value: -1 }; t.value <= 1; t.value += 0.5) blockCircle(s.x + Math.cos(s.r) * t.value * s.s * 1.1, s.z - Math.sin(s.r) * t.value * s.s * 1.1, 0.25)
}
