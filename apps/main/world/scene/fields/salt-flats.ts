import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { clusters } from "#/world/scene/fields/clusters"
import { saltPillars } from "#/world/scene/fields/salt-pillars"
import { saltWorks } from "#/world/scene/fields/salt-works"
import { deadTrees } from "#/world/scene/fields/dead-trees"
import { rocks } from "#/world/scene/fields/rocks"
import { tufts } from "#/world/scene/fields/tufts"
import { cairn } from "#/world/scene/fields/cairn"

/**
 * The salt flat (map-salt-flats): a white crust cracked into plates, brine lying in sheets on it,
 * pillars of salt grown up in groves, and the salt works where the road ends.
 */
export function saltFlats(root: THREE.Group) {
  const far = (x: number, z: number) => Math.hypot(x - 36, z - 15) > 9
  saltPillars(root, clusters({ seed: 2701, groups: 16, per: 7, spread: 2.2, s0: 0.6, s1: 1.3, ok: (x, z) => offRoad(1.4)(x, z) && far(x, z) }))
  saltPillars(
    root,
    scatter({
      seed: 2702,
      count: 30,
      s0: 0.4,
      s1: 0.9,
      ok: (x, z) => offRoad(1.4)(x, z) && far(x, z),
    }),
  )
  // bleached trees that drowned when the brine came in, the grass dying back from the old shore
  deadTrees(
    root,
    scatter({
      seed: 2703,
      count: 12,
      s0: 0.8,
      s1: 1.2,
      ok: (x, z) => offRoad(2)(x, z) && far(x, z),
    }),
  )
  tufts(
    root,
    scatter({
      seed: 2704,
      count: 70,
      s0: 0.5,
      s1: 0.9,
      ok: (x, z) => x < 12 && offRoad(0.8)(x, z),
    }),
  )
  rocks(
    root,
    scatter({
      seed: 2705,
      count: 20,
      s0: 0.2,
      s1: 0.6,
      ok: offRoad(1),
    }),
    M.rock,
  )
  // stones piled every so often along the road, so it can be found when the brine is up
  for (const p of [
    [9, 31.2],
    [17.5, 28.8],
    [25.2, 26.6],
  ])
    cairn(root, p[0], p[1])
  saltWorks(root, 34, 15)
}
