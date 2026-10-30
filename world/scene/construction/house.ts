import * as THREE from "three"
import { glowOwner } from "#/world/scene/construction/houses"
import type { HouseOpts } from "#/world/scene/construction/houses"
import { houseInner } from "#/world/scene/construction/helpers/houses/house-inner"

export function house(root: THREE.Group, o: HouseOpts) {
  glowOwner.value = o.name ?? null
  try {
    return houseInner(root, o)
  } finally {
    glowOwner.value = null
  }
}
