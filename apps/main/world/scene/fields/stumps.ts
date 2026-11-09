import * as THREE from "three"

const stumpGeo = new THREE.CylinderGeometry(0.2, 0.26, 0.32, 7).translate(0, 0.12, 0)

import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

export function stumps(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: stumpGeo,
    material: M.wood,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.25 * s.s)
}
