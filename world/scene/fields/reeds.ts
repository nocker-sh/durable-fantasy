import type { Spot } from "#/world/scene/fields/instancing"
import * as THREE from "three"
import { instanced } from "#/world/scene/fields/instancing"
import { tuftGeo } from "#/world/scene/fields/tufts"
import { reedMat } from "#/world/scene/fields/vegetation"
export function reeds(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: tuftGeo,
    material: reedMat,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s * 2.6, s.s],
    ],
  })
}
