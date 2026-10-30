import * as THREE from "three"

import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"

import { leafTex } from "#/world/scene/textures/leaves"
const coneGeo = new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0)

const frostMat = mat(leafTex("frost", 32))

const pineMat = mat(leafTex("moss", 31))

import { M } from "#/world/scene/construction/materials"
import { hash2 } from "#/lib/engine/hash2"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { trunkGeo } from "#/world/scene/fields/vegetation"

export function pines(root: THREE.Group, spots: Spot[], frosty = true) {
  instanced({
    root: root,
    geo: trunkGeo,
    material: M.woodDark,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [s.s, s.s * 1.1, s.s],
    ],
  })
  const tiers: [number, number, number][] = [
    [0.95, 1.3, 0.6],
    [0.72, 1.1, 1.3],
    [0.46, 0.95, 1.95],
  ]
  // frost on the tops of some trees, the ones standing in the open
  const white = (s: Spot) => frosty && hash2(Math.floor(s.x * 7), Math.floor(s.z * 7), 9) < 0.35
  tiers.forEach((entry, i) => {
    const rad = entry[0]
    const h = entry[1]
    const y = entry[2]

    const at = (s: Spot): ReturnType<Parameters<typeof instanced>[0]["place"]> => [
      [s.x, groundH(s.x, s.z) + y * s.s, s.z],
      [0, s.r + i, 0],
      [rad * s.s, h * s.s, rad * s.s],
    ]
    if (i < 2) instanced({ root: root, geo: coneGeo, material: pineMat, spots: spots, place: at })
    else {
      instanced({ root: root, geo: coneGeo, material: frostMat, spots: spots.filter(white), place: at })
      instanced({ root: root, geo: coneGeo, material: pineMat, spots: spots.filter((s) => !white(s)), place: at })
    }
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.3 * s.s)
}
