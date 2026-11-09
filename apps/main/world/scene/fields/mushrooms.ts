import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const capGeo = new THREE.ConeGeometry(0.09, 0.07, 6).translate(0, 0.12, 0)

const stem = colorMat(0xe0d6c0)

const capBrown = colorMat(0x8a6a4a)

const capRed = colorMat(0xa83a32)

import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { stemGeo } from "#/world/scene/fields/vegetation"

export function mushrooms(root: THREE.Group, spots: Spot[]) {
  // little clusters of three: food for the inn's soup
  const all: Spot[] = spots.flatMap((s) => [0, 1, 2].map((k) => ({ x: s.x + Math.cos(s.r + k * 2) * 0.14, z: s.z + Math.sin(s.r + k * 2) * 0.14, s: s.s * (1 - k * 0.2), r: s.r + k })))
  instanced({
    root: root,
    geo: stemGeo,
    material: stem,
    spots: all,
    place: (s) => [
      [s.x, s.z],
      [0, 0, 0],
      [s.s, s.s, s.s],
    ],
  })
  instanced({
    root: root,
    geo: capGeo,
    material: capRed,
    spots: all.filter((_, i) => i % 2 === 0),
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
  })
  instanced({
    root: root,
    geo: capGeo,
    material: capBrown,
    spots: all.filter((_, i) => i % 2 === 1),
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s, s.s],
    ],
  })
}
