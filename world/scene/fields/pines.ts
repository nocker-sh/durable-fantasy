import type * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { leafTex } from "#/world/scene/textures/leaves"
import { hash2 } from "#/lib/engine/hash2"
import type { Spot } from "#/world/scene/fields/instancing"
import { conifers } from "#/world/scene/fields/conifers"
import { sway } from "#/world/scene/fields/sway"

const pineBoughs = mat(leafTex("moss", 31)).clone()
const frostBoughs = mat(leafTex("frost", 32)).clone()

export function pines(root: THREE.Group, spots: Spot[], frosty = true) {
  conifers({
    root: root,
    spots: spots,
    // the boughs move in the wind (sway hooks the material to this map's clock)
    boughs: sway(pineBoughs, 0.025),
    cap: sway(frostBoughs, 0.025),
    // frost on the tops of some trees, the ones standing in the open
    capped: (s) => frosty && hash2(Math.floor(s.x * 7), Math.floor(s.z * 7), 9) < 0.35,
  })
}
