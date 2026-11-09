import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { WATER_Y } from "#/world/maps/ground/rules"
import { MARSH_PONDS } from "#/world/maps/marsh-ponds"
import { groundH } from "#/world/scene/ground-h"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { clusters } from "#/world/scene/fields/clusters"
import { shore } from "#/world/scene/fields/shore"
import { reeds } from "#/world/scene/fields/reeds"
import { tufts } from "#/world/scene/fields/tufts"
import { lilyPads } from "#/world/scene/fields/lily-pads"
import { jetty } from "#/world/scene/fields/jetty"
import { boat } from "#/world/scene/fields/boat"
import { deadTrees } from "#/world/scene/fields/dead-trees"
import { broadleaves } from "#/world/scene/fields/broadleaves"
import { logs } from "#/world/scene/fields/logs"
import { stumps } from "#/world/scene/fields/stumps"
import { mushrooms } from "#/world/scene/fields/mushrooms"
import { shrubs } from "#/world/scene/fields/shrubs"
import { emptyShrine } from "#/world/scene/fields/empty-shrine"

const open = (x: number, z: number, from: number) => MARSH_PONDS.some((p) => Math.hypot(x - p[0], z - p[1]) < p[2] - from)

/**
 * The lily marsh (map-lily-marsh): four ponds with pads and flowers on the still water, reeds
 * round their edges, the road on a causeway between them, and a jetty where the marsh folk tie a punt.
 */
export function lilyMarsh(root: THREE.Group) {
  // pads only on open water, in rafts rather than evenly, clear of the shore
  lilyPads(root, clusters({ seed: 2501, groups: 30, per: 10, spread: 1.8, s0: 0.6, s1: 1.1, ok: (x, z) => groundH(x, z) < WATER_Y - 0.25 && open(x, z, 1.2) }))
  reeds(
    root,
    scatter({
      seed: 2502,
      count: 420,
      s0: 0.7,
      s1: 1.2,
      ok: shore,
    }),
  )
  reeds(root, clusters({ seed: 2503, groups: 14, per: 14, spread: 1.4, s0: 0.8, s1: 1.2, ok: (x, z) => shore(x, z) || (groundH(x, z) < WATER_Y && !open(x, z, 2.2)) }))
  tufts(
    root,
    scatter({
      seed: 2504,
      count: 200,
      s0: 0.6,
      s1: 1.1,
      ok: offRoad(0.8),
    }),
  )
  // drowned trees standing in the water, alders and willows on the hummocks
  deadTrees(
    root,
    scatter({
      seed: 2505,
      count: 9,
      s0: 0.8,
      s1: 1.3,
      ok: (x, z) => groundH(x, z) < WATER_Y - 0.1 && open(x, z, 1.5),
    }),
  )
  broadleaves(
    root,
    clusters({
      seed: 2506,
      groups: 0,
      per: 4,
      spread: 2.4,
      s0: 0.7,
      s1: 1.1,
      ok: offRoad(2.2),
      near: [
        [5, 27],
        [42.5, 24],
        [30.5, 5],
        [6, 6],
        [42, 45],
      ],
    }),
    M.leaf2,
  )
  shrubs(root, clusters({ seed: 2507, groups: 6, per: 4, spread: 1.8, s0: 0.6, s1: 1.0, ok: offRoad(1.4) }))
  logs(
    root,
    scatter({
      seed: 2508,
      count: 6,
      s0: 0.8,
      s1: 1.1,
      ok: offRoad(1.6),
    }),
    M.woodDark,
  )
  stumps(
    root,
    clusters({
      seed: 2509,
      groups: 0,
      per: 3,
      spread: 1.2,
      s0: 0.7,
      s1: 1.0,
      ok: offRoad(1.4),
      near: [
        [16, 11],
        [32, 41],
      ],
    }),
  )
  mushrooms(
    root,
    clusters({
      seed: 2510,
      groups: 0,
      per: 5,
      spread: 1,
      s0: 0.8,
      s1: 1.1,
      ok: offRoad(1.2),
      near: [
        [6, 26.5],
        [42, 23.5],
      ],
    }),
  )
  // the jetty out into the south-east pond, the punt tied at its end
  jetty({ root: root, x0: 29, z0: 31.6, x1: 32.2, z1: 33.6 })
  boat({ root: root, x: 33.4, z: 32.4, rot: 0.6 })
  // the boat is built for a beach; this one floats, level, riding low in the water
  const punt = root.children[root.children.length - 1]
  punt.position.y = WATER_Y - 0.2
  punt.rotation.z = 0
  // a field shrine on the causeway, the way travellers mark a place where the road was once lost
  emptyShrine(root, 26.2, 18.5)
}
