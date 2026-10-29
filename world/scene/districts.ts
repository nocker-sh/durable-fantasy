// The town's districts beyond the market square: their ground (Layout) and what stands on it.
// Each is its own map, joined to the square by its roads (world/maps). The houses, stalls and
// trees come from the same builders as the square, so every district keeps its look.
import * as THREE from "three"
import { GB } from "./gfx"
import { Rng } from "./pix"
import {
  barrel,
  bench,
  bush,
  cart,
  crate,
  fence,
  forge,
  anvil,
  lantern,
  places,
  sack,
  stall,
  stalls,
  table,
  tree,
  well,
  woodpile,
  haystack,
  M,
  buildHouses,
  updaters,
  movingObjects,
  type V2,
} from "./build"
import { groundH, isFree, N, roadD, riverD, blockRect, currentLayout } from "./world"
import { MARKET, CRAFT, GATE, FIELDS } from "../maps/ground-layouts.ts"
import { crops, wheatField } from "./construction/crops.ts"
import { trough } from "./construction/workshops.ts"

export { MARKET, CRAFT, GATE, FIELDS }

/** A ring of trees around the edge, keeping the roads and their ends clear. */
function forestRing(root: THREE.Group, seed: number, depth = 5) {
  const tr = new Rng(seed)
  for (let i = 0; i < 300; i++) {
    const x = tr.next() * N,
      z = tr.next() * N
    const edge = Math.min(x, z, N - x, N - z)
    if (edge > depth + tr.next() * 3) continue
    if (roadD(x, z) < 1.4) continue
    if (riverD(x, z) < currentLayout().riverHW + 1.2) continue
    if (!isFree(x, z)) continue
    tree(root, x, z, 0.9 + tr.next() * 0.6, tr.next() < 0.18 ? "autumn" : tr.next() < 0.5 ? "leaf2" : "leaf", seed * 10 + i)
  }
}

function shrubs(root: THREE.Group, spots: V2[], seed: number) {
  const r = new Rng(seed)
  for (const [x, z] of spots) bush(root, x, z, 0.35 + r.next() * 0.2, "leaf2", true)
}

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
  const night: [string, number, number, Parameters<typeof stall>[3], [string, string]][] = [
    ["nm1", 15.5, 27.6, ["bread", "bread", "jug"], ["cWine", "cLinen"]], // Elsa's fried dough, Berta's old clothes later
    ["nm2", 20.2, 27.6, ["turnip", "onion"], ["cRed", "cLinen"]], // Ulrike's baked potatoes
    ["nm3", 24.0, 28.6, ["plum", "plum", "onion"], ["cMustard", "cLinen"]], // Karl's chestnuts; Lukas's wares by day
    ["nm4", 27.8, 27.6, ["appleG", "grape"], ["cGreen", "cLinen"]], // Sophie's flowers
  ]
  night.forEach(([place, x, z, goods, stripe], i) => {
    const s = stall(root, x, z, goods, stripe, [], 51 + i, "n")
    stallDressing(s.group, i < 3)
    stalls[place] = { ...s, vanish: true }
    places[place] = s.seller
  })
  const gb = new GB()
  bench(gb, 24, 20.4, 1.3, true)
  barrel(gb, 19.6, 21.6)
  barrel(gb, 19.2, 22.2, 0.6, 0.24)
  crate(gb, 26.2, 21.0)
  crate(gb, 26.2, 21.0, 0.4, groundH(26.2, 21.0) + 0.4)
  sack(gb, 19.2, 20.4)
  sack(gb, 19.6, 20.6)
  bench(gb, 6.2, 26.2, 0.9, true) // by the tavern door, clear of it
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

/** A night stall's lamp under the awning, and steam off the food (both go with the stall). */
function stallDressing(g: THREE.Object3D, steam: boolean) {
  const glow = new THREE.MeshLambertMaterial({ color: 0x3a3020, emissive: new THREE.Color(0xffc060), emissiveIntensity: 1.6 })
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.14), glow)
  lamp.position.set(0.7, 1.5, 0.35)
  g.add(lamp)
  const light = new THREE.PointLight(0xffb060, 1.6, 4.5, 1.6)
  light.position.set(0.7, 1.4, 0.6)
  g.add(light)
  if (!steam) return
  const puffs = [0, 1, 2].map((k) => {
    const p = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xe8e4e0, transparent: true, opacity: 0.35, depthWrite: false }))
    g.add(p)
    movingObjects.add(p)
    return { p, k }
  })
  updaters.push((t) =>
    puffs.forEach(({ p, k }) => {
      const a = (t * 0.5 + k / 3) % 1
      p.position.set(-0.3 + Math.sin(t + k) * 0.08, 0.85 + a * 0.9, 0)
      p.scale.setScalar(0.18 + a * 0.3)
      ;(p.material as THREE.SpriteMaterial).opacity = 0.4 * (1 - a)
    }),
  )
}

/**
 * The alley behind the shopping street's north row, and the back of the tavern across the street.
 * Empty bottles wait behind the tavern for the brewery, herbs grow in pots behind the apothecary,
 * a rain barrel stands under each eave.
 */
function backAlley(root: THREE.Group) {
  const gb = new GB()
  // behind the tavern: crates of empty bottles going back to the brewery, a spare barrel
  crate(gb, 3.2, 34.8, 0.5)
  crate(gb, 3.2, 34.8, 0.4, groundH(3.2, 34.8) + 0.4)
  barrel(gb, 5.6, 34.7, 0.6, 0.26)
  // rain barrels under the eaves, between the houses
  for (const [x, z] of [
    [7.55, 17.9],
    [12.75, 17.9],
    [18.9, 18.2],
    [32.65, 18.0],
    [38.7, 18.0],
    [44.2, 18.4],
  ] as V2[])
    barrel(gb, x, z, 0.55, 0.24)
  // behind the general store: sacks waiting to be shelved
  sack(gb, 17.8, 15.0)
  sack(gb, 18.2, 15.2)
  crate(gb, 18.9, 14.9, 0.45)
  // behind the crystal shop: a locked chest, nothing else
  crate(gb, 35.6, 15.0, 0.55)
  bench(gb, 23.0, 14.7, 1.0, true)
  root.add(gb.build())
  lantern(root, 12.8, 15.0)
  lantern(root, 27.0, 15.0)
  lantern(root, 39.2, 15.0)
}

/** Workshops along an east–west lane, yards behind them. */
export function buildCraft(root: THREE.Group) {
  buildHouses(root, "phanthiet-craft")
  // the lane's own well: quenching at the forge and the tanner's vats need water
  well(root, 24.5, 30.5)
  // and one at the west end, for the loggers' and the charcoal burners' houses
  well(root, 9.5, 37)
  // yards: a second forge, timber, hides drying
  forge(root, 16.6, 26.4)
  const gb = new GB()
  anvil(gb, 17.6, 27.8)
  woodpile(gb, 14.6, 28.4, 1.6, 4, true)
  woodpile(gb, 11.85, 18.8, 1.4, 3, false)
  barrel(gb, 18.8, 26.2, 0.55, 0.3)
  crate(gb, 25.4, 25.6)
  crate(gb, 26.2, 25.8, 0.4)
  table(gb, 27.2, 26.6, 1.2, 0.6)
  sack(gb, 28.4, 27.6)
  root.add(gb.build())
  cart(root, 22.4, 26.4, 0.6, "barrels")
  haystack(root, 36.4, 31.6, 0.8)
  for (const x of [4, 12, 22, 30, 38]) lantern(root, x, 21.8)
  shrubs(
    root,
    [
      [11.6, 24.8],
      [22.6, 21.4],
      [36, 24.4],
      [5.4, 24.6],
    ],
    9,
  )
  forestRing(root, 81)

  places.armorer = [8.3, 22.4]
  places.woodworker = [15, 22.4]
  places.leatherworker = [27.2, 22.2]
  places.craftForge = [16.6, 27.4]
  places.craftWell = [24.5, 29.4]
  places.craftWell2 = [9.5, 35.4]
}

/** The road south to the gate in the town wall, with the warehouse and the guards. */
export function buildGate(root: THREE.Group) {
  // the town wall across the south, with the gate in the middle
  const gb = new GB()
  const wallZ = 40
  for (const [x0, x1] of [
    [0, 21.6],
    [26.4, 48],
  ] as V2[]) {
    const y = groundH((x0 + x1) / 2, wallZ)
    gb.box(M.ashlar, null, x0, y - 0.6, wallZ - 0.5, x1, y + 2.6, wallZ + 0.5, 2)
    blockRect(x0, wallZ - 0.6, x1, wallZ + 0.6)
  }
  // gate towers
  for (const x of [20.4, 27.6]) {
    const y = groundH(x, wallZ)
    gb.box(M.ashlar, null, x - 1.2, y - 0.6, wallZ - 1.2, x + 1.2, y + 3.8, wallZ + 1.2, 2)
    blockRect(x - 1.25, wallZ - 1.25, x + 1.25, wallZ + 1.25)
  }
  barrel(gb, 22.2, 37.6)
  barrel(gb, 25.8, 37.4, 0.6, 0.25)
  crate(gb, 34.5, 10.8)
  crate(gb, 35.1, 11.5, 0.45)
  crate(gb, 34.6, 12.2, 0.4) // stacked by the warehouse's east wall
  sack(gb, 35.2, 10.2)
  sack(gb, 35.5, 12.8)
  bench(gb, 24, 15, 1.3, true)
  root.add(gb.build())
  buildHouses(root, "phanthiet-gate")
  well(root, 24, 18)
  // the west lane's own well, for the hunter's, the teacher's and the watch's houses
  well(root, 6.5, 33)
  fence(
    root,
    [
      [13, 10],
      [17, 10],
      [17, 13],
      [13, 13],
      [13, 10],
    ],
    [[17, 11.5]],
    0.5,
  )
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
  places.gateWell2 = [6.5, 34.6]
}

/** A fenced rect with a gap for its gate. */
function pen(root: THREE.Group, r: { x0: number; z0: number; x1: number; z1: number }, gate: V2, h: number) {
  fence(
    root,
    [
      [r.x0, r.z0],
      [r.x1, r.z0],
      [r.x1, r.z1],
      [r.x0, r.z1],
      [r.x0, r.z0],
    ],
    [gate],
    h,
  )
}

/** The tenant farms west of the town: rye and vegetables, the dairy's pasture, the butcher's sties. */
export function buildFields(root: THREE.Group) {
  buildHouses(root, "phanthiet-fields")
  const L = currentLayout()
  wheatField(root, L.fields[0])
  wheatField(root, L.fields[1])
  crops(root, L.fields[2], "cabbage", 61)
  crops(root, L.fields[3], "turnip", 62)
  // the farmers' well where the lanes meet
  well(root, 18.1, 25.7)
  const P = L.pigpen,
    Q = L.pasture
  pen(root, P, [P.x0, P.z0 + 1.2], 0.65)
  pen(root, Q, [Q.x0 + 1, Q.z0], 0.75)
  const gb = new GB()
  trough(gb, P.x1 - 0.6, P.z1 - 0.5, true)
  trough(gb, Q.x0 + 2.4, Q.z0 + 1.1, true)
  trough(gb, Q.x1 - 1.2, Q.z1 - 1.4, false)
  // the butcher's yard: the block, the brine, the smoke wood
  table(gb, 38.9, 25.4, 1.1, 0.6)
  barrel(gb, 39.6, 27.2)
  barrel(gb, 38.6, 28.4, 0.5, 0.3)
  woodpile(gb, 38.4, 29.5, 1.2, 3, true)
  // the dairy's churns and the tenants' tools by their doors
  barrel(gb, 29.2, 24.4, 0.5, 0.25)
  crate(gb, 9.6, 22.0, 0.45)
  sack(gb, 16.1, 21.0)
  sack(gb, 3.5, 21.0)
  bench(gb, 19.9, 24.8, 1.2, true)
  root.add(gb.build())
  cart(root, 16.6, 15.8, 0.6, "hay")
  haystack(root, 1.8, 25.5, 0.8)
  haystack(root, 45.6, 37, 0.9)
  haystack(root, 45.4, 39.2, 0.75)
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
