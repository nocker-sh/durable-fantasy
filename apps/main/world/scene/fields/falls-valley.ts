import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { VALLEY_STREAM, VALLEY_POOL } from "#/world/maps/valley-stream"
import { Polyline } from "#/lib/engine/polyline"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { clusters } from "#/world/scene/fields/clusters"
import { shore } from "#/world/scene/fields/shore"
import { stream } from "#/world/scene/fields/stream"
import { spray } from "#/world/scene/fields/spray"
import { reeds } from "#/world/scene/fields/reeds"
import { tufts } from "#/world/scene/fields/tufts"
import { rocks } from "#/world/scene/fields/rocks"
import { pines } from "#/world/scene/fields/pines"
import { broadleaves } from "#/world/scene/fields/broadleaves"
import { shrubs } from "#/world/scene/fields/shrubs"
import { logs } from "#/world/scene/fields/logs"
import { mushrooms } from "#/world/scene/fields/mushrooms"
import { flowers } from "#/world/scene/fields/flowers"
import { fireRing } from "#/world/scene/fields/fire-ring"

const bed = new Polyline([...VALLEY_STREAM])

/**
 * The valley of the falls (map-falls-valley): the stream comes off the high ground in the north-west,
 * drops over two steps of rock and gathers in the pool in the south-east. Boulders in the water,
 * moss and ferns where the spray reaches, pines on the benches.
 */
export function fallsValley(root: THREE.Group) {
  // the water: narrow at the spring, widening as it goes
  const feet = stream(root, [...VALLEY_STREAM, [VALLEY_POOL[0], VALLEY_POOL[1]]], (k) => 0.7 + k * 0.9)
  for (const foot of feet) spray(root, foot)
  const nearWater = (x: number, z: number) => bed.distance(x, z) < 2.2
  // boulders at the falls and along the bed, the stream breaking white round them
  rocks(
    root,
    clusters({
      seed: 2601,
      groups: 0,
      per: 7,
      spread: 1.4,
      s0: 0.4,
      s1: 1.2,
      ok: (x, z) => offRoad(1)(x, z) || bed.distance(x, z) < 1.4,
      near: [
        [18.4, 22],
        [21, 23.5],
        [30.4, 33.6],
        [32.2, 35],
        [8, 12.5],
      ],
    }),
    M.rockDark,
  )
  rocks(
    root,
    scatter({
      seed: 2602,
      count: 50,
      s0: 0.3,
      s1: 0.9,
      ok: (x, z) => bed.distance(x, z) > 0.8 && bed.distance(x, z) < 2.6 && offRoad(0.9)(x, z),
    }),
    M.rock,
  )
  reeds(
    root,
    scatter({
      seed: 2603,
      count: 120,
      s0: 0.7,
      s1: 1.1,
      ok: (x, z) => shore(x, z) && Math.hypot(x - VALLEY_POOL[0], z - VALLEY_POOL[1]) < VALLEY_POOL[2] + 1.5,
    }),
  )
  // ferns and moss in the spray, pines on the benches, a few birches by the pool
  tufts(
    root,
    scatter({
      seed: 2604,
      count: 200,
      s0: 0.6,
      s1: 1.1,
      ok: offRoad(0.8),
    }),
  )
  shrubs(
    root,
    scatter({
      seed: 2605,
      count: 30,
      s0: 0.6,
      s1: 1.0,
      ok: (x, z) => nearWater(x, z) && bed.distance(x, z) > 1.1 && offRoad(1.2)(x, z),
    }),
  )
  pines(
    root,
    scatter({
      seed: 2606,
      count: 40,
      s0: 0.8,
      s1: 1.3,
      ok: (x, z) => offRoad(2.4)(x, z) && bed.distance(x, z) > 3,
    }),
  )
  broadleaves(
    root,
    clusters({
      seed: 2607,
      groups: 0,
      per: 3,
      spread: 2.2,
      s0: 0.7,
      s1: 1.0,
      ok: offRoad(2),
      near: [
        [44.5, 40],
        [33, 45],
      ],
    }),
    M.leaf,
  )
  flowers(
    root,
    clusters({
      seed: 2608,
      groups: 0,
      per: 12,
      spread: 1.6,
      s0: 0.6,
      s1: 1.0,
      ok: offRoad(0.9),
      near: [
        [40, 33.5],
        [26.5, 38],
      ],
    }),
  )
  mushrooms(
    root,
    clusters({
      seed: 2609,
      groups: 0,
      per: 5,
      spread: 1,
      s0: 0.8,
      s1: 1.1,
      ok: offRoad(1.2),
      near: [
        [12.5, 21],
        [36, 18],
      ],
    }),
  )
  logs(root, clusters({ seed: 2610, groups: 0, per: 2, spread: 1.5, s0: 0.8, s1: 1.1, ok: offRoad(1.6), near: [[14.5, 24]] }), M.woodDark)
  // where people stop to fill their flasks and rest: a ring of stones on the bench above the lower fall
  fireRing(root, 34.6, 31.2)
}
