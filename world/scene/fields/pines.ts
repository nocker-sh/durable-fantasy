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
import { sway } from "#/world/scene/fields/sway"

const pineBoughs = pineMat.clone()
const frostBoughs = frostMat.clone()
const grey = (k: number) => {
  const v = Math.max(0, Math.min(255, Math.round(255 * k)))
  return (v << 16) | (v << 8) | v
}

export function pines(root: THREE.Group, spots: Spot[], frosty = true) {
  // the boughs move in the wind (sway hooks the material to this map's clock)
  const swayingPine = sway(pineBoughs, 0.025)
  const swayingFrost = sway(frostBoughs, 0.025)
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
  // four tiers of boughs, each narrower and lighter than the one below it
  const tiers: [number, number, number, number][] = [
    [0.98, 1.15, 0.5, 0.78],
    [0.8, 1.05, 1.05, 0.88],
    [0.6, 0.95, 1.55, 0.97],
    [0.38, 0.85, 2.05, 1.06],
  ]
  // frost on the tops of some trees, the ones standing in the open
  const white = (s: Spot) => frosty && hash2(Math.floor(s.x * 7), Math.floor(s.z * 7), 9) < 0.35
  tiers.forEach((entry, i) => {
    const rad = entry[0]
    const h = entry[1]
    const y = entry[2]
    const shade = entry[3]
    const tint = (s: Spot) => grey(shade * (0.88 + hash2(Math.floor(s.x * 5), Math.floor(s.z * 5), 19) * 0.24))

    const at = (s: Spot): ReturnType<Parameters<typeof instanced>[0]["place"]> => [
      [s.x, groundH(s.x, s.z) + y * s.s, s.z],
      [0, s.r + i, 0],
      [rad * s.s, h * s.s, rad * s.s],
    ]
    if (i < 3) instanced({ root: root, geo: coneGeo, material: swayingPine, spots: spots, place: at, tint })
    else {
      instanced({ root: root, geo: coneGeo, material: swayingFrost, spots: spots.filter(white), place: at })
      instanced({ root: root, geo: coneGeo, material: swayingPine, spots: spots.filter((s) => !white(s)), place: at, tint })
    }
  })
  for (const s of spots) blockCircle(s.x, s.z, 0.3 * s.s)
}
