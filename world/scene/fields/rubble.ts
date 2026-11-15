import * as THREE from "three"
import { hash2 } from "#/lib/engine/hash2"
import { M } from "#/world/scene/construction/materials"
import { groundH } from "#/world/scene/ground-h"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

const blockGeo = new THREE.BoxGeometry(0.46, 0.3, 0.32)
const capGeo = new THREE.BoxGeometry(0.4, 0.06, 0.28).translate(0, 0.17, 0)

/**
 * Cut stones fallen from a wall and left in the grass, each sunk at its own angle, moss on the
 * ones that have lain longest. Small enough to step over: drawn only.
 */
export function rubble(root: THREE.Group, spots: Spot[]) {
  const place = (s: Spot): ReturnType<Parameters<typeof instanced>[0]["place"]> => [
    [s.x, groundH(s.x, s.z) + 0.05 * s.s, s.z],
    [Math.sin(s.r * 5) * 0.35, s.r, Math.cos(s.r * 7) * 0.3],
    [s.s, s.s, s.s],
  ]
  instanced({ root: root, geo: blockGeo, material: M.ashlar, spots: spots.filter((_, i) => i % 3 !== 0), place: place })
  instanced({ root: root, geo: blockGeo, material: M.stoneDark, spots: spots.filter((_, i) => i % 3 === 0), place: place })
  instanced({
    root: root,
    geo: capGeo,
    material: ruinMats.moss,
    spots: spots.filter((s) => hash2(Math.floor(s.x * 9), Math.floor(s.z * 9), 141) < 0.4),
    place: place,
    shadow: false,
  })
}
