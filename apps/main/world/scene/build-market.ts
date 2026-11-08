import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { barrel } from "#/world/scene/construction/barrel"
import { bench } from "#/world/scene/construction/bench"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { well } from "#/world/scene/construction/well"
import { lantern } from "#/world/scene/construction/lantern"
import { places, stalls } from "#/world/scene/construction/registry"
import { stall } from "#/world/scene/construction/stalls"
import { buildHouses } from "#/world/scene/construction/build-houses"
import { groundH } from "#/world/scene/ground-h"
import { forestRing } from "#/world/scene/helpers/districts/forest-ring"
import { shrubs } from "#/world/scene/helpers/districts/shrubs"
import { stallDressing } from "#/world/scene/helpers/districts/stall-dressing"
import { backAlley } from "#/world/scene/helpers/districts/back-alley"

/** Shops along both sides of an east–west street at z = 24. */
export function buildMarket(root: THREE.Group) {
  // north side, doors facing south onto the street
  buildHouses(root, "phanthiet-market")
  // south side, doors facing north

  // the little square with its well, a few stalls and benches
  well(root, 24, 24)
  // and the back street's well, for the houses south of the night stalls
  well(root, 12.5, 33)
  // the night market: street sellers' stalls, put up when they come and gone when they leave (economy.md §4.6)
  const night: [string, number, number, Parameters<typeof stall>[0]["goods"], [string, string]][] = [
    ["nm1", 15.5, 27.6, ["bread", "bread", "jug"], ["cWine", "cLinen"]],
    // Elsa's fried dough, Berta's old clothes later
    ["nm2", 20.2, 27.6, ["turnip", "onion"], ["cRed", "cLinen"]],
    // Ulrike's baked potatoes
    ["nm3", 24.0, 28.6, ["plum", "plum", "onion"], ["cMustard", "cLinen"]],
    // Karl's chestnuts; Lukas's wares by day
    ["nm4", 27.8, 27.6, ["appleG", "grape"], ["cGreen", "cLinen"]], // Sophie's flowers
  ]
  night.forEach(([place, x, z, goods, stripe], i) => {
    const s = stall({
      root: root,
      x: x,
      z: z,
      goods: goods,
      stripe: stripe,
      hang: [],
      seed: 51 + i,
      facing: "n",
    })
    stallDressing(s.group, i < 3)
    stalls[place] = {
      ...s,
      vanish: true,
    }
    places[place] = s.seller
  })
  const gb = new GB()
  bench({
    gb: gb,
    x: 24,
    z: 20.4,
    w: 1.3,
    alongX: true,
  })
  barrel({
    gb: gb,
    x: 19.6,
    z: 21.6,
  })
  barrel({
    gb: gb,
    x: 19.2,
    z: 22.2,
    h: 0.6,
    r: 0.24,
  })
  crate({
    gb: gb,
    x: 26.2,
    z: 21.0,
  })
  crate({
    gb: gb,
    x: 26.2,
    z: 21.0,
    s: 0.4,
    y: groundH(26.2, 21.0) + 0.4,
  })
  sack({
    gb: gb,
    x: 19.2,
    z: 20.4,
  })
  sack({
    gb: gb,
    x: 19.6,
    z: 20.6,
  })
  bench({
    gb: gb,
    x: 6.2,
    z: 26.2,
    w: 0.9,
    alongX: true,
  }) // by the tavern door, clear of it
  root.add(gb.build())
  for (const x of [7.6, 12.8, 20.5, 27, 32.7, 38.7, 44.8]) lantern(root, x, 22.5)
  for (const x of [9, 30, 39]) lantern(root, x, 25.8)
  shrubs(
    root,
    [
      [14.6, 26.6],
      [27.2, 26.4],
      [20.6, 21.4],
      [32.7, 22.3],
      [8.6, 31.4],
    ],
    3,
  )
  backAlley(root)
  forestRing(root, 61)
  places.tavern = [5.6, 25.9]
  places.apothecary = [10.2, 22.6]
  places.general = [15.9, 22.6]
  places.tailor = [29.95, 22.6]
  places.crystal = [35.7, 22.6]
  places.buyer = [4.5, 22.6]
  places.marketWell = [24, 25.6]
  places.marketWell2 = [12.5, 34.6]
}
