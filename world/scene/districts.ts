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
  laundryLine,
  M,
  buildHouses,
  updaters,
  type V2,
} from "./build"
import { groundH, isFree, N, roadD, riverD, blockRect, currentLayout } from "./world"
import { MARKET, CRAFT, GATE } from "../maps/ground-layouts.ts"

export { MARKET, CRAFT, GATE }

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
  crate(gb, 28.6, 21.4)
  crate(gb, 28.6, 21.4, 0.4, groundH(28.6, 21.4) + 0.4)
  sack(gb, 14.4, 22.4)
  sack(gb, 14.8, 22.6)
  bench(gb, 8.1, 22.5, 0.9, true) // by the tavern door, clear of it
  root.add(gb.build())
  for (const x of [3, 14, 21, 27, 34, 45]) lantern(root, x, 22.4)
  for (const x of [9, 30, 39]) lantern(root, x, 25.8)
  shrubs(
    root,
    [
      [14.6, 26.6],
      [27.2, 26.4],
      [20.6, 21.4],
      [33.8, 22.4],
      [8.6, 31.4],
    ],
    3,
  )
  backAlley(root)
  forestRing(root, 61)

  places.tavern = [6.4, 22.6]
  places.apothecary = [11.9, 22.4]
  places.general = [17.1, 22.5]
  places.tailor = [30.7, 22.4]
  places.crystal = [36.1, 22.5]
  places.buyer = [5.8, 25.7]
  places.marketWell = [24, 25.6]
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
 * The alley behind the shopping street's north row. The tavern hangs out its tablecloths and the
 * tailor her dyed cloth across it; empty bottles wait behind the tavern for the brewery, herbs grow
 * in pots behind the apothecary, a rain barrel stands under each eave.
 */
function backAlley(root: THREE.Group) {
  laundryLine(root, 5.2, 17.0, 5.6, 14.6, 81) // the tavern's tablecloths
  laundryLine(root, 7.6, 17.0, 7.9, 14.7, 82)
  laundryLine(root, 29.6, 17.0, 29.4, 14.6, 83) // the tailor's dyed cloth
  laundryLine(root, 31.8, 17.0, 32.2, 14.6, 84)
  const gb = new GB()
  // behind the tavern: crates of empty bottles going back to the brewery, a spare barrel
  crate(gb, 4.4, 15.0, 0.5)
  crate(gb, 4.4, 15.0, 0.4, groundH(4.4, 15.0) + 0.4)
  barrel(gb, 6.6, 14.9, 0.6, 0.26)
  // rain barrels under the eaves
  for (const x of [11.2, 16.4, 33.0, 36.8, 41.4]) barrel(gb, x, 17.0, 0.55, 0.24)
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
  // yards: a second forge, timber, hides drying
  forge(root, 16.6, 26.4)
  const gb = new GB()
  anvil(gb, 17.6, 27.8)
  woodpile(gb, 14.6, 28.4, 1.6, 4, true)
  woodpile(gb, 11.4, 18.6, 1.4, 3, false)
  barrel(gb, 18.8, 26.2, 0.55, 0.3)
  crate(gb, 25.4, 25.6)
  crate(gb, 26.2, 25.8, 0.4)
  table(gb, 27.2, 26.6, 1.2, 0.6)
  sack(gb, 28.4, 27.6)
  root.add(gb.build())
  laundryLine(root, 24.6, 28.4, 28.8, 28.6, 8)
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
}
