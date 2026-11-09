import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { rockGeo } from "#/world/scene/fields/vegetation"

export function rocks(root: THREE.Group, spots: Spot[], material: THREE.Material = M.rock) {
  instanced({
    root: root,
    geo: rockGeo,
    material: material,
    spots: spots,
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 0.12 * s.s, s.z],
      [s.r, s.r * 3, s.r * 0.5],
      [s.s, s.s * 0.62, s.s * 0.85],
    ],
  })
  for (const s of spots) if (s.s > 0.6) blockCircle(s.x, s.z, 0.4 * s.s)
}
