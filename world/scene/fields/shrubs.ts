import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"

import { leafTex } from "#/world/scene/textures/leaves"
const berry = colorMat(0x8a2a3a)

const shrubMat = mat(leafTex("moss", 41))

const shrubGeo = new THREE.IcosahedronGeometry(1, 0).scale(1, 0.62, 1).translate(0, 0.32, 0)

import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"
import { stemGeo } from "#/world/scene/fields/vegetation"

/** Low shrubs, the size of a crouching person: some keep a few dark berries through the cold. */
export function shrubs(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: shrubGeo,
    material: shrubMat,
    spots: spots,
    place: (s) => [
      [s.x, s.z],
      [0, s.r, 0],
      [0.45 * s.s, 0.5 * s.s, 0.4 * s.s],
    ],
  })
  const berries = spots
    .filter((_, i) => i % 3 === 0)
    .flatMap((s) => [0, 1, 2].map((k) => ({ x: s.x + Math.cos(s.r + k * 2.1) * 0.32 * s.s, z: s.z + Math.sin(s.r + k * 2.1) * 0.3 * s.s, s: s.s, r: s.r })))
  instanced({
    root: root,
    geo: stemGeo,
    material: berry,
    spots: berries,
    place: (b) => [
      [b.x, groundH(b.x, b.z) + 0.32 * b.s, b.z],
      [0, 0, 0],
      [1.6, 0.6, 1.6],
    ],
  })
  for (const sp of spots) if (sp.s > 0.8) blockCircle(sp.x, sp.z, 0.3 * sp.s)
}
