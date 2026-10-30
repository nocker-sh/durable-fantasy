import * as THREE from "three"

const branchGeo = new THREE.CylinderGeometry(0.03, 0.045, 1, 5).rotateZ(Math.PI / 2)

import { M } from "#/world/scene/construction/materials"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

/** Fallen branches lying in the grass or the needles, a few together; they block nothing. */
export function branches(root: THREE.Group, spots: Spot[], material: THREE.Material = M.woodDark) {
  const all = spots.flatMap((s) => [0, 1, 2].map((k) => ({ x: s.x + Math.cos(s.r + k) * 0.25, z: s.z + Math.sin(s.r + k) * 0.25, s: s.s * (1 - k * 0.2), r: s.r + k * 0.9 })))
  instanced({
    root: root,
    geo: branchGeo,
    material: material,
    spots: all,
    place: (b) => [
      [b.x, groundH(b.x, b.z) + 0.04, b.z],
      [0, b.r, 0],
      [0.9 * b.s, 1, 1],
    ],
  })
}
