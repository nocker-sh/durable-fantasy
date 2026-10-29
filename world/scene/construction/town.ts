import type * as THREE from "three"
import { GB } from "../gfx"
import { PixBuf, Rng, RAMPS, pick } from "../pix"
import { basket, clutter } from "../goods"
import { groundH, blockCircle, N, riverD, roadD, inRect, isFree, currentLayout } from "../world"
import { buildHouses } from "./houses.ts"
import { chapel } from "./chapel.ts"
import { stair, fence } from "./fences.ts"
import { places, stalls, type V2 } from "./registry.ts"
import { bridge, lavoir } from "./waterworks.ts"
import { well, bench, barrel, crate, sack, table, woodpile, bucket } from "./furniture.ts"
import { stall, type Goods } from "./stalls.ts"
import { lantern, oven, forge, anvil, trough } from "./workshops.ts"
import { addSprite, flatDecal } from "./sprites.ts"
import { M } from "./materials.ts"
import { crops, wheatField } from "./crops.ts"
import { haystack, cart } from "./cart.ts"
import { windmill } from "./windmill.ts"
import { bush, tree } from "./vegetation.ts"

// ---------------------------------------------------------------- the town
export function buildTown(root: THREE.Group) {
  // houses
  buildHouses(root, "phanthiet")
  // farm

  chapel(root)
  // terrace stairs
  stair(root, currentLayout().stairs.x0, currentLayout().stairs.x1, currentLayout().stairs.z0, currentLayout().stairs.z1, currentLayout().terrace.h, groundH(16, currentLayout().stairs.z1 + 0.1), 9)
  places.stairsTop = [16.1, 11.4]
  bridge(root)
  lavoir(root)

  // plaza: well, stalls, benches
  well(root, currentLayout().plaza[0], currentLayout().plaza[1])
  places.well = [currentLayout().plaza[0], currentLayout().plaza[1] + 1.4]
  places.well2 = [currentLayout().plaza[0] - 1.4, currentLayout().plaza[1]]
  const s1 = stall(root, 17.0, 21.3, ["apple", "appleG", "pear", "plum"], ["cRed", "cLinen"], ["garlic", "herb", "garlic"], 11, "s")
  const s2 = stall(root, 21.9, 21.2, ["cabbage", "carrot", "onion", "turnip"], ["cGreen", "cLinen"], ["herb", "herb", "garlic", "herb"], 12, "s")
  const s3 = stall(root, 15.9, 27.0, ["fish", "fish", "fish"], ["cBlue", "cLinen"], [], 13, "n")
  // the fourth stall waits for the street sellers (backlog.md 6), shut under a cloth
  const s4 = stall(root, 22.2, 27.0, [], ["cMustard", "cRed"], [], 14, "n")
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
  bench(pb, 18.5, 21.3, 1.3, true)
  places.bench = [18.5, 21.45]
  bench(pb, 24.0, 24.8, 1.3, false)
  barrel(pb, 10.35, 18.8)
  barrel(pb, 10.3, 19.45, 0.6, 0.24) // the bakery's water and flour barrels, in the corner of its yard
  crate(pb, 23.6, 22.2)
  crate(pb, 23.6, 22.2, 0.4, groundH(23.6, 22.2) + 0.4)
  sack(pb, 17.4, 28.2)
  sack(pb, 17.8, 28.4)
  root.add(pb.build())
  lantern(root, 15.2, 24.2)
  lantern(root, 23.0, 25.6)
  lantern(root, 19.9, 30.2)
  lantern(root, 18.0, 17.6)
  lantern(root, 28.6, 21.0)
  lantern(root, 10.6, 24.2)
  lantern(root, 9.5, 33.3) // the back lane
  lantern(root, 26.05, 12.0) // the lane behind the north side

  // bakery yard, in front of the shop: the oven at the west end, Hans's bread board at the east, by the square
  oven(root, 11.0, 20.6)
  places.oven = [11.0, 21.85]
  const bk = new GB()
  table(bk, 14.0, 20.8, 1.0, 0.55)
  places.knead = [14.0, 20.25] // Hans sells from here
  woodpile(bk, 8.95, 16.0, 1.2, 3, false)
  sack(bk, 14.6, 19.0)
  sack(bk, 14.9, 19.15)
  sack(bk, 14.7, 19.5)
  root.add(bk.build())
  addSprite(root, basket("bread", 7, 30, 24), 13.8, groundH(14.0, 20.8) + 0.62, 20.8)
  addSprite(root, basket("roll" as Goods, 8, 26, 22), 14.3, groundH(14.0, 20.8) + 0.62, 20.85)

  // smithy yard, east of the smithy's door, open to the square
  forge(root, 14.4, 29.4)
  places.forge = [14.4, 30.35]
  const sm = new GB()
  anvil(sm, 15.4, 31.4)
  places.anvil = [15.4, 32.1]
  barrel(sm, 16.2, 29.4, 0.55, 0.3) // quench
  woodpile(sm, 13.0, 32.4, 1.3, 3, true)
  crate(sm, 16.3, 32.5, 0.45)
  root.add(sm.build())
  for (let i = 0; i < 3; i++) flatDecal(root, clutter("chips", i), 14.6 + i * 0.5, 31.8 - i * 0.3, 40)

  // woodcutter
  const wc = new GB()
  woodpile(wc, 3.0, 22.3, 1.5, 4, false)
  woodpile(wc, 3.8, 20.8, 1.5, 3, true)
  const cy = groundH(4.0, 23.8)
  wc.cyl(M.woodV, M.wood, 4.0, 23.8, cy - 0.1, cy + 0.38, 0.3, 0.3, 9, 2)
  places.chop = [4.0, 24.45]
  blockCircle(4.0, 23.8, 0.32)
  root.add(wc.build())
  for (let i = 0; i < 4; i++) flatDecal(root, clutter("chips", 10 + i), 3.6 + (i % 2) * 0.6, 23.5 + (i >> 1) * 0.6, 40, i)

  places.hang = [25.2, 39.0]

  // inn: tables and barrels
  const inn = new GB()
  table(inn, 22.4, 27.3, 1.0, 0.6)
  bench(inn, 22.4, 27.9, 1.0, true)
  barrel(inn, 26.6, 27.7)
  barrel(inn, 27.2, 28.0)
  barrel(inn, 26.8, 27.1, 0.6, 0.25)
  root.add(inn.build())
  places.innFront = [24.5, 27.7]

  // gardens
  currentLayout().gardens.forEach((g, i) => {
    crops(root, { ...g, axis: "x" }, (["cabbage", "carrot", "turnip"] as Goods[])[i], 40 + i)
    fence(
      root,
      [
        [g.x0, g.z0],
        [g.x1, g.z0],
        [g.x1, g.z1],
        [g.x0, g.z1],
        [g.x0, g.z0],
      ],
      [[g.x1, (g.z0 + g.z1) / 2]],
      0.5,
    )
  })
  places.garden = [currentLayout().gardens[1].x0 + 1, currentLayout().gardens[1].z1 - 0.6]

  // fields, pens, pasture
  crops(root, currentLayout().fields[1], "cabbage", 50)
  wheatField(root, currentLayout().fields[0])
  places.field = [currentLayout().fields[1].x0 - 0.4, (currentLayout().fields[1].z0 + currentLayout().fields[1].z1) / 2]
  const P = currentLayout().pigpen
  fence(
    root,
    [
      [P.x0, P.z0],
      [P.x1, P.z0],
      [P.x1, P.z1],
      [P.x0, P.z1],
      [P.x0, P.z0],
    ],
    [],
    0.65,
  )
  const tg = new GB()
  trough(tg, P.x1 - 0.6, P.z1 - 0.5, true) // on the far side from the road
  trough(tg, currentLayout().pasture.x0 + 0.8, currentLayout().pasture.z0 + 1.2, false)
  root.add(tg.build())
  places.pigpen = [P.x1 + 0.4, P.z0 + 0.5]
  const Q = currentLayout().pasture
  fence(
    root,
    [
      [Q.x0, Q.z0],
      [Q.x1, Q.z0],
      [Q.x1, Q.z1],
      [Q.x0, Q.z1],
      [Q.x0, Q.z0],
    ],
    [[Q.x0, Q.z0 + 0.7]],
    0.75,
  )
  places.pasture = [Q.x0 - 0.5, Q.z0 + 0.7]
  haystack(root, 46.0, 6.6)
  haystack(root, 46.2, 8.6, 0.85)
  haystack(root, 39.4, 21.4, 0.8)
  cart(root, 36.6, 6.0, 0.3, "hay")
  cart(root, 24.2, 20.6, -1.2, "cabbage")
  cart(root, 28.6, 41.6, 0, "barrels")
  const fm = new GB()
  sack(fm, 40.2, 18.7)
  sack(fm, 40.55, 18.9)
  crate(fm, 40.5, 19.5, 0.45)
  bucket(fm, 38.6, 18.6, undefined, false)
  woodpile(fm, 45.6, 15.75, 1.6, 4, false)
  root.add(fm.build())
  places.coop = [39.4, 19.2]

  // windmill
  windmill(root, 45.0, 4.0)

  // flowerbeds & bushes around town
  const fl = new Rng(4)
  for (const [x, z] of [
    [16.6, 19.6],
    [21.8, 19.4],
    [6.6, 32.8],
    [17.0, 33.0],
    [20.6, 33.4],
    [25.2, 23.8],
    [8.6, 23.6],
    [6.4, 26.6],
    [11.9, 39.6],
    [20.6, 39.0],
    [26.2, 12.0],
  ] as V2[]) {
    const r = 0.35 + fl.next() * 0.2
    if (roadD(x, z) > r + 0.35 && isFree(x, z)) bush(root, x, z, r, "leaf2", true)
  }

  // trees: town + forest ring
  const tr = new Rng(9)
  const townTrees: V2[] = [
    [18.8, 9],
    [14, 10.6],
    [5, 4.4],
    [1.6, 12.6],
    [26.4, 21.2],
    [12.6, 43.6],
    [16.6, 41],
    [29.4, 26.4],
    [36.2, 30.6],
    [38.2, 34.8],
    [1.2, 32.4],
    [30.2, 44],
    [23.2, 5.6],
  ]
  townTrees.forEach(([x, z], i) => tree(root, x, z, 0.9 + tr.next() * 0.35, i % 4 === 0 ? "autumn" : i % 3 === 0 ? "leaf2" : "leaf", i))
  for (let i = 0; i < 260; i++) {
    const x = tr.next() * N,
      z = tr.next() * N
    const edge = Math.min(x, z, N - x, N - z)
    if (edge > 4 + tr.next() * 3) continue
    if (riverD(x, z) < currentLayout().riverHW + 1.2) continue
    if (roadD(x, z) < 0.9) continue
    if (!isFree(x, z)) continue
    if (inRect(x, z, currentLayout().pasture, 0.5) || inRect(x, z, currentLayout().fields[0], 0.6) || inRect(x, z, currentLayout().terrace, 0.3)) continue
    tree(root, x, z, 0.9 + tr.next() * 0.6, tr.next() < 0.15 ? "autumn" : tr.next() < 0.5 ? "leaf2" : "leaf", 100 + i)
  }
  // reeds along the natural river banks
  const reed = new PixBuf(20, 30)
  for (let k = 0; k < 12; k++) {
    const x = 2 + ((k * 7) % 17),
      h = 14 + ((k * 5) % 14)
    for (let y = 0; y < h; y++) reed.set(x + Math.round(Math.sin(y / 6 + k) * 0.6), 29 - y, pick("wild", 0.3 + (y / h) * 0.6, x, y))
    if (k % 3 === 0)
      for (let y = h - 5; y < h; y++) {
        reed.set(x, 29 - y, RAMPS.timber[3])
        reed.set(x + 1, 29 - y, RAMPS.timber[2])
      }
  }
  for (let i = 0; i < 400; i++) {
    const x = tr.next() * N,
      z = tr.next() * N
    const d = riverD(x, z)
    if (d < currentLayout().riverHW - 0.2 || d > currentLayout().riverHW + 0.8) continue
    if (z > 9 && z < 37) continue
    addSprite(root, reed, x, groundH(x, z) - 0.05, z, 40)
  }
  // scattered clutter decals around yards
  const cl = new Rng(31)
  for (let i = 0; i < 60; i++) {
    const x = 2 + cl.next() * 44,
      z = 2 + cl.next() * 44
    if (riverD(x, z) < currentLayout().riverHW + 0.3) continue
    const kind = roadD(x, z) < 0 ? "straw" : cl.pick(["straw", "leaves", "shards", "leaves"])
    flatDecal(root, clutter(kind, i), x, z, 40, cl.next() * 6)
  }
  // little ground details in pens/coop
  for (let i = 0; i < 6; i++) flatDecal(root, clutter("straw", 200 + i), 36.8 + i * 0.4, 18.6 + (i % 2) * 0.5, 40)
  // bank railings over the embankment walls in town
  void currentLayout().plazaR
}
