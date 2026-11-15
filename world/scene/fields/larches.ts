import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import type { Spot } from "#/world/scene/fields/instancing"
import { conifers } from "#/world/scene/fields/conifers"
import { sway } from "#/world/scene/fields/sway"

const goldBoughs = M.gold.clone()

/** Larches: the conifers that turn gold before their needles fall, bright among the dark pines. */
export function larches(root: THREE.Group, spots: Spot[]) {
  conifers({ root: root, spots: spots, boughs: sway(goldBoughs, 0.03) })
}
