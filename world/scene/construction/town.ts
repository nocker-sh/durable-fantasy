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
  barrel(pb, 11.55, 19.7)
  barrel(pb, 11.5, 20.35, 0.6, 0.24) // the bakery's water and flour barrels, by its west wall
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

  // bakery yard: the oven at the west end, the door at the east, Hans's bread board beside it
  oven(root, 12.6, 21.6)
  places.oven = [12.6, 22.85]
  const bk = new GB()
  table(bk, 15.4, 22.3, 1.0, 0.55)
  places.knead = [15.4, 21.75] // Hans sells from here
  woodpile(bk, 10.5, 18.8, 1.2, 3, false)
  sack(bk, 16.4, 20.85)
  sack(bk, 16.75, 21.0)
  sack(bk, 16.55, 21.35)
  root.add(bk.build())
  addSprite(root, basket("bread", 7, 30, 24), 15.2, groundH(15.4, 22.3) + 0.62, 22.3)
  addSprite(root, basket("roll" as Goods, 8, 26, 22), 15.7, groundH(15.4, 22.3) + 0.62, 22.35)

  // smithy yard
  forge(root, 11.6, 27.6)
  places.forge = [11.6, 28.55]
  const sm = new GB()
  anvil(sm, 12.6, 29.0)
  places.anvil = [12.6, 29.7]
  barrel(sm, 13.6, 27.6, 0.55, 0.3) // quench
  woodpile(sm, 9.6, 27.4, 1.3, 3, true)
  crate(sm, 13.7, 30.2, 0.45)
  root.add(sm.build())
  for (let i = 0; i < 3; i++) flatDecal(root, clutter("chips", i), 12.2 + i * 0.5, 30.2 - i * 0.3, 40)

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

  places.hang = [27.4, 35.4]

  // inn: tables and barrels
  const inn = new GB()
  table(inn, 20.5, 27.9 + 4.5 - 4.4, 1.0, 0.6)
  bench(inn, 20.5, 28.55, 1.0, true)
  barrel(inn, 26.9, 28.5)
  barrel(inn, 27.3, 29.1)
  barrel(inn, 26.95, 29.7, 0.6, 0.25)
  root.add(inn.build())
  places.innFront = [24.2, 27.8]

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
  haystack(root, 46.2, 11.0)
  haystack(root, 46.4, 9.4, 0.85)
  haystack(root, 39.4, 20.8, 0.8)
  cart(root, 39.3, 11.2, 0.3, "hay")
  cart(root, 24.2, 20.6, -1.2, "cabbage")
  cart(root, 27.6, 36.6, 0, "barrels")
  const fm = new GB()
  sack(fm, 39.7, 18.6)
  sack(fm, 40.05, 18.8)
  crate(fm, 40.0, 19.4, 0.45)
  bucket(fm, 37.4, 18.3, undefined, false)
  woodpile(fm, 46.6, 19.8, 1.6, 4, false)
  root.add(fm.build())
  places.coop = [37.8, 18.6]

  // windmill
  windmill(root, 45.0, 4.0)

  // flowerbeds & bushes around town
  const fl = new Rng(4)
  for (const [x, z] of [
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
    const r = 0.35 + fl.next() * 0.2
    if (roadD(x, z) > r + 0.35) bush(root, x, z, r, "leaf2", true)
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
