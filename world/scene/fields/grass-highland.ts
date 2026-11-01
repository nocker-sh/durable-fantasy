import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { haystack } from "#/world/scene/construction/haystack"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { edgeward } from "#/world/scene/fields/helpers/scatter/edgeward"
import { verge } from "#/world/scene/fields/verge"
import { clusters } from "#/world/scene/fields/clusters"
import { pampas } from "#/world/scene/fields/pampas"
import { tufts } from "#/world/scene/fields/tufts"
import { rocks } from "#/world/scene/fields/rocks"
import { shrubs } from "#/world/scene/fields/shrubs"
import { broadleaves } from "#/world/scene/fields/broadleaves"
import { rustedMachine } from "#/world/scene/fields/rusted-machine"
import { warLitter } from "#/world/scene/fields/war-litter"
import { cairn } from "#/world/scene/fields/cairn"
import { dryingRack } from "#/world/scene/fields/drying-rack"

/**
 * The silver-grass highland (map-grass-highland): pampas grass in drifts over the swells, nodding in
 * the wind; the walking engine dead on its knoll; the cutters' stooks of grass for the town's thatch
 * standing along the trail.
 */
export function grassHighland(root: THREE.Group) {
  const free = offRoad(1.1)
  // the grass in drifts: thick in the swells, thinning out on the knoll and at the road
  pampas(
    root,
    clusters(2401, 40, 22, 3.4, 0.7, 1.2, (x, z) => free(x, z) && Math.hypot(x - 13, z - 13) > 4.5),
  )
  pampas(
    root,
    scatter({
      seed: 2402,
      count: 260,
      s0: 0.6,
      s1: 1.1,
      ok: free,
    }),
  )
  pampas(
    root,
    scatter({
      seed: 2403,
      count: 70,
      s0: 0.7,
      s1: 1.1,
      ok: verge(1.2, 3),
    }),
  )
  tufts(
    root,
    scatter({
      seed: 2404,
      count: 220,
      s0: 0.6,
      s1: 1.1,
      ok: offRoad(0.8),
    }),
  )
  // the dead giant on the knoll, its pieces in the grass, a cairn by the trail's end
  rustedMachine(root, 13, 12.4)
  warLitter(root, 15.5, 14.6, 2405)
  cairn(root, 16.6, 16.8)
  rocks(
    root,
    clusters(2406, 0, 9, 2, 0.3, 1.0, offRoad(1), [
      [10, 15.5],
      [36.5, 35],
      [32, 12.5],
    ]),
    M.rockDark,
  )
  // a few wind-bent trees and bushes in the lee of the rises
  broadleaves(
    root,
    clusters(2407, 0, 3, 2.5, 0.7, 1.0, offRoad(2.5), [
      [39.5, 39.5],
      [6, 30],
    ]),
    M.autumn,
  )
  shrubs(
    root,
    clusters(2408, 0, 4, 2, 0.6, 1.0, offRoad(1.4), [
      [38, 36],
      [7, 31],
      [30, 10.5],
      [42, 18],
    ]),
  )
  // the cutters' work: stooks along the south trail, a rack for drying the cut stalks by the road
  for (const p of [
    [28.4, 34.2],
    [30, 37.6],
    [31.8, 35.4],
    [33.6, 38.8],
  ])
    haystack({ root: root, x: p[0], z: p[1], s: 0.55 })
  dryingRack(root, 27.2, 27.4)
  rocks(
    root,
    scatter({
      seed: 2409,
      count: 40,
      s0: 0.12,
      s1: 0.3,
      ok: (x, z) => edgeward(10)(x, z) && offRoad(0.6)(x, z),
    }),
  )
}
