import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import { rockGeo } from "#/world/scene/fields/vegetation"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

export function cairn(root: THREE.Group, x: number, z: number) {
  const spots: Spot[] = []
  for (const k = { value: 0 }; k.value < 6; k.value++) spots.push({ x, z, s: 0.7 - k.value * 0.1, r: k.value * 1.3 })
  instanced({
    root: root,
    geo: rockGeo,
    material: M.rock,
    spots: spots,
    place: (s) => [
      [s.x, groundH(s.x, s.z) + (0.7 - s.s) * 1.2, s.z],
      [s.r, s.r, 0],
      [s.s, s.s * 0.6, s.s],
    ],
  })
  blockCircle(x, z, 0.5)
}
