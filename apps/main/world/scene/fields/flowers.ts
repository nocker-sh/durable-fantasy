import type { Spot } from "#/world/scene/fields/instancing"
import * as THREE from "three"
import { flowerMats } from "#/world/scene/fields/vegetation"
import { instanced } from "#/world/scene/fields/instancing"
import { tuftGeo } from "#/world/scene/fields/tufts"
export function flowers(root: THREE.Group, spots: Spot[]) {
  flowerMats.forEach((m, k) =>
    instanced({
      root: root,
      geo: tuftGeo,
      material: m,
      spots: spots.filter((_, i) => i % flowerMats.length === k),
      place: (s) => [
        [s.x, s.z],
        [0, s.r, 0],
        [s.s * 0.8, s.s * 0.7, s.s * 0.8],
      ],
    }),
  )
}
