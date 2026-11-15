import type * as THREE from "three"
import { vnoise } from "#/lib/engine/vnoise"
import type { Spot } from "#/world/scene/fields/instancing"
import { pines } from "#/world/scene/fields/pines"
import { larches } from "#/world/scene/fields/larches"

/**
 * Conifers as they stand in a cold country: dark pines, and among them stands of larch gone gold.
 * The larches gather in groves, so a wood shows a patch of gold here and there rather than a speckle.
 */
export function woods(root: THREE.Group, spots: Spot[], frosty = true) {
  const gold = (s: Spot) => vnoise({ x: s.x, y: s.z, scale: 0.22, seed: 61 }) > (frosty ? 0.63 : 0.76)
  pines(
    root,
    spots.filter((s) => !gold(s)),
    frosty,
  )
  larches(root, spots.filter(gold))
}
