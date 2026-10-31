import type { V2 } from "#/world/scene/construction/registry"
import { shrubs } from "#/world/scene/helpers/districts/shrubs"
import * as THREE from "three"
import { buildHouses } from "#/world/scene/construction/build-houses"
import { currentLayout } from "#/world/scene/current-layout"
import { wheatField } from "#/world/scene/construction/helpers/crops/wheat-field"
import { crops } from "#/world/scene/construction/crops"
import { well } from "#/world/scene/construction/well"
import { pen } from "#/world/scene/helpers/districts/pen"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { trough } from "#/world/scene/construction/trough"
import { table } from "#/world/scene/construction/table"
import { barrel } from "#/world/scene/construction/barrel"
import { woodpile } from "#/world/scene/construction/woodpile"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { bench } from "#/world/scene/construction/bench"
import { cart } from "#/world/scene/construction/cart"
import { haystack } from "#/world/scene/construction/haystack"
import { lantern } from "#/world/scene/construction/lantern"
import { forestRing } from "#/world/scene/helpers/districts/forest-ring"
import { places } from "#/world/scene/construction/registry"
export function buildFields(root: THREE.Group) {
  buildHouses(root, "phanthiet-fields")
  const L = currentLayout()
  wheatField(root, L.fields[0])
  wheatField(root, L.fields[1])
  crops({
    root: root,
    f: L.fields[2],
    kind: "cabbage",
    seed: 61,
  })
  crops({
    root: root,
    f: L.fields[3],
    kind: "turnip",
    seed: 62,
  })
  // the farmers' well where the lanes meet
  well(root, 18.1, 25.7)
  const P = L.pigpen,
    Q = L.pasture
  pen(root, P, [P.x0, P.z0 + 1.2], 0.65)
  pen(root, Q, [Q.x0 + 1, Q.z0], 0.75)
  const gb = new GB()
  trough({
    gb: gb,
    x: P.x1 - 0.6,
    z: P.z1 - 0.5,
    alongX: true,
  })
  trough({
    gb: gb,
    x: Q.x0 + 2.4,
    z: Q.z0 + 1.1,
    alongX: true,
  })
  trough({
    gb: gb,
    x: Q.x1 - 1.2,
    z: Q.z1 - 1.4,
    alongX: false,
  })
  // the butcher's yard: the block, the brine, the smoke wood
  table({
    gb: gb,
    x: 38.9,
    z: 25.4,
    w: 1.1,
    d: 0.6,
  })
  barrel({
    gb: gb,
    x: 39.6,
    z: 27.2,
  })
  barrel({
    gb: gb,
    x: 38.6,
    z: 28.4,
    h: 0.5,
    r: 0.3,
  })
  woodpile({
    gb: gb,
    x: 38.4,
    z: 29.5,
    len: 1.2,
    layers: 3,
    alongX: true,
  })
  // the dairy's churns and the tenants' tools by their doors
  barrel({
    gb: gb,
    x: 29.2,
    z: 24.4,
    h: 0.5,
    r: 0.25,
  })
  crate({
    gb: gb,
    x: 9.6,
    z: 22.0,
    s: 0.45,
  })
  sack({
    gb: gb,
    x: 16.1,
    z: 21.0,
  })
  sack({
    gb: gb,
    x: 3.5,
    z: 21.0,
  })
  bench({
    gb: gb,
    x: 19.9,
    z: 24.8,
    w: 1.2,
    alongX: true,
  })
  root.add(gb.build())
  cart({
    root: root,
    x: 16.6,
    z: 15.8,
    rot: 0.6,
    load: "hay",
  })
  haystack({
    root: root,
    x: 1.8,
    z: 25.5,
    s: 0.8,
  })
  haystack({
    root: root,
    x: 45.6,
    z: 37,
    s: 0.9,
  })
  haystack({
    root: root,
    x: 45.4,
    z: 39.2,
    s: 0.75,
  })
  for (const [x, z] of [
    [21.8, 20.6],
    [10, 24.2],
    [21.2, 28],
  ] as V2[])
    lantern(root, x, z)
  shrubs(
    root,
    [
      [16.5, 15.2],
      [22.6, 15.6],
      [37.8, 15.4],
      [19.4, 36.2],
    ],
    19,
  )
  forestRing(root, 91, 3)
  places.fieldsWell = [18.1, 26.8]
  places.rye = [15.5, 8]
  places.rye2 = [23.5, 9]
  places.cabbages = [17, 36]
  places.turnips = [25.5, 31.5]
  places.sties = [P.x0 - 0.5, P.z0 + 1.2]
  places.butcherYard = [38.6, 26.4]
  places.meadow = [Q.x0 + 1, Q.z0 - 0.6]
}
