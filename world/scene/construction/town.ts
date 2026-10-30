import { getWellPlace } from "#/world/town/get-well-place"
import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { pick } from "#/world/scene/pick"
import { basket } from "#/world/scene/basket"
import { clutter } from "#/world/scene/clutter"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { N } from "#/world/scene/world"
import { riverD } from "#/world/scene/river-d"
import { roadD } from "#/world/scene/road-d"
import { inRect } from "#/world/scene/in-rect"
import { isFree } from "#/world/scene/is-free"
import { currentLayout } from "#/world/scene/current-layout"
import { buildHouses } from "#/world/scene/construction/build-houses"
import { chapel } from "#/world/scene/construction/chapel"
import { stair } from "#/world/scene/construction/helpers/fences/stair"
import { fence } from "#/world/scene/construction/fence"
import { places, stalls } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"
import { bridge } from "#/world/scene/construction/helpers/waterworks/bridge"
import { lavoir } from "#/world/scene/construction/helpers/waterworks/lavoir"
import { well } from "#/world/scene/construction/well"
import { bench } from "#/world/scene/construction/bench"
import { barrel } from "#/world/scene/construction/barrel"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { table } from "#/world/scene/construction/table"
import { woodpile } from "#/world/scene/construction/woodpile"
import { bucket } from "#/world/scene/construction/bucket"
import { stall, type Goods } from "#/world/scene/construction/stalls"
import { lantern } from "#/world/scene/construction/lantern"
import { oven } from "#/world/scene/construction/oven"
import { forge } from "#/world/scene/construction/forge"
import { anvil } from "#/world/scene/construction/anvil"
import { trough } from "#/world/scene/construction/trough"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { flatDecal } from "#/world/scene/construction/flat-decal"
import { M } from "#/world/scene/construction/materials"
import { crops } from "#/world/scene/construction/crops"
import { wheatField } from "#/world/scene/construction/helpers/crops/wheat-field"
import { haystack } from "#/world/scene/construction/haystack"
import { cart } from "#/world/scene/construction/cart"
import { windmill } from "#/world/scene/construction/windmill"
import { bush } from "#/world/scene/construction/bush"
import { tree } from "#/world/scene/construction/tree"

// ---------------------------------------------------------------- the town
export function buildTown(root: THREE.Group) {
  // houses
  buildHouses(root, "phanthiet")
  // farm

  chapel(root)
  // terrace stairs
  stair({
    root: root,
    x0: currentLayout().stairs.x0,
    x1: currentLayout().stairs.x1,
    zTop: currentLayout().stairs.z0,
    zBot: currentLayout().stairs.z1,
    yTop: currentLayout().terrace.h,
    yBot: groundH(16, currentLayout().stairs.z1 + 0.1),
    n: 9,
  })
  places.stairsTop = [16.1, 11.4]
  bridge(root)
  lavoir(root)

  // plaza: well, stalls, benches
  well(root, currentLayout().plaza[0], currentLayout().plaza[1])
  places.well = getWellPlace(currentLayout().plaza, "well")
  places.well2 = getWellPlace(currentLayout().plaza, "well2")
  const s1 = stall({ root: root, x: 17.0, z: 21.3, goods: ["apple", "appleG", "pear", "plum"], stripe: ["cRed", "cLinen"], hang: ["garlic", "herb", "garlic"], seed: 11, facing: "s" })
  const s2 = stall({ root: root, x: 21.9, z: 21.2, goods: ["cabbage", "carrot", "onion", "turnip"], stripe: ["cGreen", "cLinen"], hang: ["herb", "herb", "garlic", "herb"], seed: 12, facing: "s" })
  const s3 = stall({ root: root, x: 15.9, z: 27.0, goods: ["fish", "fish", "fish"], stripe: ["cBlue", "cLinen"], hang: [], seed: 13, facing: "n" })
  // the fourth stall waits for the street sellers (backlog.md 6), shut under a cloth
  const s4 = stall({ root: root, x: 22.2, z: 27.0, goods: [], stripe: ["cMustard", "cRed"], hang: [], seed: 14, facing: "n" })
  stalls.s1 = s1
  stalls.s2 = s2
  stalls.s3 = s3
  stalls.s4 = s4
  places.s1 = s1.seller
  places.s1b = s1.buyer
  places.s2 = s2.seller
  places.s2b = s2.buyer
  places.s3 = s3.seller
  places.s3b = s3.buyer
  places.s4 = s4.seller
  places.s4b = s4.buyer
  const pb = new GB()
  bench({ gb: pb, x: 18.5, z: 21.3, w: 1.3, alongX: true })
  places.bench = [18.5, 21.45]
  bench({ gb: pb, x: 24.0, z: 24.8, w: 1.3, alongX: false })
  barrel({ gb: pb, x: 11.55, z: 19.7 })
  barrel({ gb: pb, x: 11.5, z: 20.35, h: 0.6, r: 0.24 }) // the bakery's water and flour barrels, by its west wall
  crate({ gb: pb, x: 23.6, z: 22.2 })
  crate({ gb: pb, x: 23.6, z: 22.2, s: 0.4, y: groundH(23.6, 22.2) + 0.4 })
  sack({ gb: pb, x: 17.4, z: 28.2 })
  sack({ gb: pb, x: 17.8, z: 28.4 })
  root.add(pb.build())
  lantern(root, 15.2, 24.2)
  lantern(root, 23.0, 25.6)
  lantern(root, 19.9, 30.2)
  lantern(root, 18.0, 17.6)
  lantern(root, 28.6, 21.0)
  lantern(root, 10.6, 24.2)

  // bakery yard: the oven at the west end, the door at the east, Hans's bread board beside it
  oven(root, 12.6, 21.6)
  places.oven = [12.6, 22.85]
  const bk = new GB()
  table({ gb: bk, x: 15.4, z: 22.3, w: 1.0, d: 0.55 })
  places.knead = [15.4, 21.75] // Hans sells from here
  woodpile({ gb: bk, x: 10.5, z: 18.8, len: 1.2, layers: 3, alongX: false })
  sack({ gb: bk, x: 16.4, z: 20.85 })
  sack({ gb: bk, x: 16.75, z: 21.0 })
  sack({ gb: bk, x: 16.55, z: 21.35 })
  root.add(bk.build())
  addSprite({ root: root, b: basket({ kind: "bread", seed: 7, w: 30, h: 24 }), x: 15.2, y: groundH(15.4, 22.3) + 0.62, z: 22.3 })
  addSprite({ root: root, b: basket({ kind: "roll" as Goods, seed: 8, w: 26, h: 22 }), x: 15.7, y: groundH(15.4, 22.3) + 0.62, z: 22.35 })

  // smithy yard
  forge(root, 11.6, 27.6)
  places.forge = [11.6, 28.55]
  const sm = new GB()
  anvil(sm, 12.6, 29.0)
  places.anvil = [12.6, 29.7]
  barrel({ gb: sm, x: 13.6, z: 27.6, h: 0.55, r: 0.3 }) // quench
  woodpile({ gb: sm, x: 9.6, z: 27.4, len: 1.3, layers: 3, alongX: true })
  crate({ gb: sm, x: 13.7, z: 30.2, s: 0.45 })
  root.add(sm.build())
  for (let i = 0; i < 3; i++) flatDecal({ root: root, b: clutter("chips", i), x: 12.2 + i * 0.5, z: 30.2 - i * 0.3, scale: 40 })

  // woodcutter
  const wc = new GB()
  woodpile({ gb: wc, x: 3.0, z: 22.3, len: 1.5, layers: 4, alongX: false })
  woodpile({ gb: wc, x: 3.8, z: 20.8, len: 1.5, layers: 3, alongX: true })
  const cy = groundH(4.0, 23.8)
  wc.cyl({ side: M.woodV, top: M.wood, centerX: 4.0, centerZ: 23.8, fromY: cy - 0.1, toY: cy + 0.38, fromRadius: 0.3, toRadius: 0.3, segments: 9, repeat: 2 })
  places.chop = [4.0, 24.45]
  blockCircle(4.0, 23.8, 0.32)
  root.add(wc.build())
  for (let i = 0; i < 4; i++) flatDecal({ root: root, b: clutter("chips", 10 + i), x: 3.6 + (i % 2) * 0.6, z: 23.5 + (i >> 1) * 0.6, scale: 40, rot: i })

  places.hang = [27.4, 35.4]

  // inn: tables and barrels
  const inn = new GB()
  table({ gb: inn, x: 20.5, z: 27.9 + 4.5 - 4.4, w: 1.0, d: 0.6 })
  bench({ gb: inn, x: 20.5, z: 28.55, w: 1.0, alongX: true })
  barrel({ gb: inn, x: 26.9, z: 28.5 })
  barrel({ gb: inn, x: 27.3, z: 29.1 })
  barrel({ gb: inn, x: 26.95, z: 29.7, h: 0.6, r: 0.25 })
  root.add(inn.build())
  places.innFront = [24.2, 27.8]

  // gardens
  currentLayout().gardens.forEach((g, i) => {
    crops({ root: root, f: { ...g, axis: "x" }, kind: (["cabbage", "carrot", "turnip"] as Goods[])[i], seed: 40 + i })
    fence({
      root: root,
      pts: [
        [g.x0, g.z0],
        [g.x1, g.z0],
        [g.x1, g.z1],
        [g.x0, g.z1],
        [g.x0, g.z0],
      ],
      gaps: [[g.x1, (g.z0 + g.z1) / 2]],
      h: 0.5,
    })
  })
  places.garden = [currentLayout().gardens[1].x0 + 1, currentLayout().gardens[1].z1 - 0.6]

  // fields, pens, pasture
  crops({ root: root, f: currentLayout().fields[1], kind: "cabbage", seed: 50 })
  wheatField(root, currentLayout().fields[0])
  places.field = [currentLayout().fields[1].x0 - 0.4, (currentLayout().fields[1].z0 + currentLayout().fields[1].z1) / 2]
  const P = currentLayout().pigpen
  fence({
    root: root,
    pts: [
      [P.x0, P.z0],
      [P.x1, P.z0],
      [P.x1, P.z1],
      [P.x0, P.z1],
      [P.x0, P.z0],
    ],
    gaps: [],
    h: 0.65,
  })
  const tg = new GB()
  trough({ gb: tg, x: P.x1 - 0.6, z: P.z1 - 0.5, alongX: true }) // on the far side from the road
  trough({ gb: tg, x: currentLayout().pasture.x0 + 0.8, z: currentLayout().pasture.z0 + 1.2, alongX: false })
  root.add(tg.build())
  places.pigpen = [P.x1 + 0.4, P.z0 + 0.5]
  const Q = currentLayout().pasture
  const pastureFence = getPastureFence(Q)
  fence({ root: root, pts: pastureFence.points, gaps: pastureFence.gaps, h: pastureFence.height })
  places.pasture = pastureFence.outside
  haystack({ root: root, x: 46.2, z: 11.0 })
  haystack({ root: root, x: 46.4, z: 9.4, s: 0.85 })
  haystack({ root: root, x: 39.4, z: 20.8, s: 0.8 })
  cart({ root: root, x: 39.3, z: 11.2, rot: 0.3, load: "hay" })
  cart({ root: root, x: 24.2, z: 20.6, rot: -1.2, load: "cabbage" })
  cart({ root: root, x: 27.6, z: 36.6, rot: 0, load: "barrels" })
  const fm = new GB()
  sack({ gb: fm, x: 39.7, z: 18.6 })
  sack({ gb: fm, x: 40.05, z: 18.8 })
  crate({ gb: fm, x: 40.0, z: 19.4, s: 0.45 })
  bucket({ gb: fm, x: 37.4, z: 18.3, y: undefined, water: false })
  woodpile({ gb: fm, x: 46.6, z: 19.8, len: 1.6, layers: 4, alongX: false })
  root.add(fm.build())
  places.coop = [37.8, 18.6]

  // windmill
  windmill(root, 45.0, 4.0)

  // flowerbeds & bushes around town
  const fl = new Rng(4)
  for (const entry of [
    [11.6, 20.2],
    [16.6, 19.6],
    [21.8, 19.4],
    [12.4, 31.8],
    [17.0, 33.0],
    [21.2, 33.0],
    [25.2, 23.8],
    [8.6, 23.6],
    [6.8, 26.8],
    [12.3, 36.5],
    [20.6, 37.5],
  ] as V2[]) {
    const x = entry[0]
    const z = entry[1]

    const r = 0.35 + fl.next() * 0.2
    if (roadD(x, z) > r + 0.35) bush({ root: root, x: x, z: z, s: r, kind: "leaf2", flowers: true })
  }

  // trees: town + forest ring
  const tr = new Rng(9)
  const townTrees: V2[] = [
    [18.8, 9],
    [14, 10.6],
    [5, 4.4],
    [4.4, 13.2],
    [9.8, 14.5],
    [26.4, 21],
    [11.2, 38.8],
    [24.8, 39.4],
    [29.4, 26.4],
    [36.2, 30.6],
    [38.2, 34.8],
    [9.2, 31.8],
    [1.8, 27.6],
    [23.2, 7.8],
  ]
  townTrees.forEach((entry2, i) => {
    const x = entry2[0]
    const z = entry2[1]
    return tree({ root: root, x: x, z: z, scale: 0.9 + tr.next() * 0.35, kind: i % 4 === 0 ? "autumn" : i % 3 === 0 ? "leaf2" : "leaf", seed: i })
  })
  for (let i = 0; i < 260; i++) {
    const x = tr.next() * N,
      z = tr.next() * N
    const edge = Math.min(x, z, N - x, N - z)
    if (edge > 4 + tr.next() * 3) continue
    if (riverD(x, z) < currentLayout().riverHW + 1.2) continue
    if (roadD(x, z) < 0.9) continue
    if (!isFree(x, z)) continue
    if (inRect({ x: x, z: z, r: currentLayout().pasture, pad: 0.5 }) || inRect({ x: x, z: z, r: currentLayout().fields[0], pad: 0.6 }) || inRect({ x: x, z: z, r: currentLayout().terrace, pad: 0.3 }))
      continue
    tree({ root: root, x: x, z: z, scale: 0.9 + tr.next() * 0.6, kind: tr.next() < 0.15 ? "autumn" : tr.next() < 0.5 ? "leaf2" : "leaf", seed: 100 + i })
  }
  // reeds along the natural river banks
  const reed = new PixBuf(20, 30)
  for (let k = 0; k < 12; k++) {
    const x = 2 + ((k * 7) % 17),
      h = 14 + ((k * 5) % 14)
    for (let y = 0; y < h; y++) reed.set({ x: x + Math.round(Math.sin(y / 6 + k) * 0.6), y: 29 - y, color: pick({ ramp: "wild", b: 0.3 + (y / h) * 0.6, x: x, y: y }) })
    if (k % 3 === 0)
      for (let y = h - 5; y < h; y++) {
        reed.set({ x: x, y: 29 - y, color: RAMPS.timber[3] })
        reed.set({ x: x + 1, y: 29 - y, color: RAMPS.timber[2] })
      }
  }
  for (let i = 0; i < 400; i++) {
    const x = tr.next() * N,
      z = tr.next() * N
    const d = riverD(x, z)
    if (d < currentLayout().riverHW - 0.2 || d > currentLayout().riverHW + 0.8) continue
    if (z > 9 && z < 37) continue
    addSprite({ root: root, b: reed, x: x, y: groundH(x, z) - 0.05, z: z, ppu: 40 })
  }
  // scattered clutter decals around yards
  const cl = new Rng(31)
  for (let i = 0; i < 60; i++) {
    const x = 2 + cl.next() * 44,
      z = 2 + cl.next() * 44
    if (riverD(x, z) < currentLayout().riverHW + 0.3) continue
    const kind = roadD(x, z) < 0 ? "straw" : cl.pick(["straw", "leaves", "shards", "leaves"])
    flatDecal({ root: root, b: clutter(kind, i), x: x, z: z, scale: 40, rot: cl.next() * 6 })
  }
  // little ground details in pens/coop
  for (let i = 0; i < 6; i++) flatDecal({ root: root, b: clutter("straw", 200 + i), x: 36.8 + i * 0.4, z: 18.6 + (i % 2) * 0.5, scale: 40 })
  // bank railings over the embankment walls in town
  void currentLayout().plazaR
}
import { getPastureFence } from "#/world/town/get-pasture-fence"
