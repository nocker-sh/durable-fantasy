import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { barrel } from "#/world/scene/construction/barrel"
import { bench } from "#/world/scene/construction/bench"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { well } from "#/world/scene/construction/well"
import { fence } from "#/world/scene/construction/fence"
import { lantern } from "#/world/scene/construction/lantern"
import { places } from "#/world/scene/construction/registry"
import { M } from "#/world/scene/construction/materials"
import { buildHouses } from "#/world/scene/construction/build-houses"
import type { V2 } from "#/world/scene/construction/registry"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { forestRing } from "#/world/scene/helpers/districts/forest-ring"
import { shrubs } from "#/world/scene/helpers/districts/shrubs"

/** The road south to the gate in the town wall, with the warehouse and the guards. */
export function buildGate(root: THREE.Group) {
  // the town wall across the south, with the gate in the middle
  const gb = new GB()
  const wallZ = 40
  for (const entry of [
    [0, 21.6],
    [26.4, 48],
  ] as V2[]) {
    const x0 = entry[0]
    const x1 = entry[1]

    const y = groundH((x0 + x1) / 2, wallZ)
    gb.box({ side: M.ashlar, top: null, x0: x0, y0: y - 0.6, z0: wallZ - 0.5, x1: x1, y1: y + 2.6, z1: wallZ + 0.5, repeat: 2 })
    blockRect({ x0: x0, z0: wallZ - 0.6, x1: x1, z1: wallZ + 0.6 })
  }
  // gate towers
  for (const x of [20.4, 27.6]) {
    const y = groundH(x, wallZ)
    gb.box({ side: M.ashlar, top: null, x0: x - 1.2, y0: y - 0.6, z0: wallZ - 1.2, x1: x + 1.2, y1: y + 3.8, z1: wallZ + 1.2, repeat: 2 })
    blockRect({ x0: x - 1.25, z0: wallZ - 1.25, x1: x + 1.25, z1: wallZ + 1.25 })
  }
  barrel({ gb: gb, x: 22.2, z: 37.6 })
  barrel({ gb: gb, x: 25.8, z: 37.4, h: 0.6, r: 0.25 })
  crate({ gb: gb, x: 34.5, z: 10.8 })
  crate({ gb: gb, x: 35.1, z: 11.5, s: 0.45 })
  crate({ gb: gb, x: 34.6, z: 12.2, s: 0.4 }) // stacked by the warehouse's east wall
  sack({ gb: gb, x: 35.2, z: 10.2 })
  sack({ gb: gb, x: 35.5, z: 12.8 })
  bench({ gb: gb, x: 24, z: 15, w: 1.3, alongX: true })
  root.add(gb.build())
  buildHouses(root, "phanthiet-gate")
  well(root, 24, 18)
  fence({
    root: root,
    pts: [
      [13, 10],
      [17, 10],
      [17, 13],
      [13, 13],
      [13, 10],
    ],
    gaps: [[17, 11.5]],
    h: 0.5,
  })
  for (const z of [6, 14, 22, 30, 37]) {
    lantern(root, 22.4, z)
    lantern(root, 25.8, z + 2)
  }
  shrubs(
    root,
    [
      [19.4, 12],
      [28.4, 17.2],
      [19.6, 31.6],
      [28.6, 33.4],
      [13, 21],
    ],
    13,
  )
  forestRing(root, 101, 4)

  places.warehouse = [30.8, 14.8]
  places.gateGuard = [22.6, 38.4]
  places.gateGuard2 = [25.4, 38.4]
  places.guide = [25.8, 18.2]
  places.gateWell = [24, 19.6]
}
