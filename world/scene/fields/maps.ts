import type * as THREE from "three"
import { GB } from "../gfx"
import { THINGS } from "../things"
import { M, barrel, crate, sack, fence, woodpile, updaters, places, type V2 } from "../build"
import { inRect, isFree, roadD } from "../world"
import { LAYOUTS, MEADOW_TERRACES, OPEN_SIDES } from "../../maps/ground-layouts.ts"
import { orchard, vineyard } from "./orchards.ts"
import { signboard, cairn, rustedMachine, brokenTower, netShed, boat, dryingRack, charcoalKiln, ruinedWall, cityWall, emptyShrine, fieldWall, fireRing, warLitter } from "./landmarks.ts"
import { windmill } from "../construction/windmill.ts"
import { broadleaves, rocks, pines, tufts, logs, stumps, mushrooms, shrubs, branches, deadTrees, trunkGeo, flowers, reeds } from "./vegetation.ts"
import { scatter, clusters, edgeward, offRoad, shore, verge } from "./scatter.ts"
import { type Spot, instanced } from "./instancing.ts"
import { BOARDS } from "../lettering.ts"

// ---------------------------------------------------------------- builders
function meadow(root: THREE.Group) {
  // the meadow as landscape.md draws it: the lone tree's hill, the pond, the old terraces up to the
  // stopped windmill, the hollow with the war engine; things gathered in groups with open grass between
  orchard(root, 6, 8, 4, 3)
  vineyard(root, 6, 16, 3, 7)
  signboard(root, 26.2, 6.4, BOARDS.orchard, 0.2)
  const free = offRoad(1.2)
  // the lone old tree on top of its hill, rocks breaking out of the scarp below it to the north-east
  broadleaves(root, [{ x: 34, z: 13, s: 1.7, r: 0.4 }], M.leaf)
  rocks(root, clusters(2010, 0, 9, 1.8, 0.5, 1.3, free, [[38.4, 9.2], [36.2, 7.6], [39.6, 12.4]]))
  rocks(root, clusters(2009, 0, 12, 2.2, 0.15, 0.4, offRoad(0.8), [[37.8, 9.6], [33, 15.8]]))
  // groves at the edges and a few old trees standing alone in the grass
  broadleaves(root, clusters(2011, 0, 6, 3, 0.7, 1.2, (x, z) => free(x, z) && !inRect(x, z, { x0: 4, z0: 6, x1: 14, z1: 24 }), [[3.5, 27], [45, 31], [17, 3.5], [44.5, 44.5], [30, 44.5]]), M.leaf2)
  broadleaves(root, scatter(2021, 3, 0.9, 1.2, (x, z) => offRoad(3)(x, z) && Math.hypot(x - 34, z - 13) > 8), M.leaf)
  pines(root, clusters(2012, 0, 7, 3.2, 0.8, 1.15, (x, z) => edgeward(5)(x, z) && free(x, z), [[3.5, 3.5], [44.5, 4], [3, 45]]))
  // the pond: reeds round its edge, a ring of stones where someone sits by the water
  reeds(root, clusters(2022, 0, 26, 3.4, 0.7, 1.1, shore, [[40.5, 19.5], [42, 21.5]]))
  fireRing(root, 37.4, 22.2)
  // the old terraces, walled along their tops, a field shrine nobody tends on the first step
  const T = MEADOW_TERRACES
  T.edges.forEach((e, k) => {
    const line = (from: number, to: number) => {
      const pts: V2[] = []
      for (let x = from; x <= to + 1e-6; x += 0.5) pts.push([x, e + Math.sin(x * 0.45 + k * 1.7 + 3) * 0.6 + 0.4])
      return pts
    }
    fieldWall(root, line(T.x0 + 0.5, T.rampX - T.rampW - 0.6), 2030 + k)
    fieldWall(root, line(T.rampX + T.rampW + 0.6, T.x1 - 1), 2040 + k)
  })
  windmill(root, 6.5, 40, true)
  emptyShrine(root, 15.5, 36)
  // the hollow: the engine in the grass, its pieces strewn about
  rustedMachine(root, 41.6, 39.6)
  warLitter(root, 41, 38.6, 2050)
  cairn(root, 25.6, 30.6)
  // the small things, thickest where the big ones stand: flowers in drifts, tufts, shrubs along the walls
  flowers(root, clusters(2014, 16, 18, 2.4, 0.6, 1.1, offRoad(0.9)))
  flowers(root, clusters(2015, 0, 14, 1.8, 0.6, 1.0, offRoad(0.9), [[34, 13], [15.5, 37.4], [38.5, 22.8], [12, 30]]))
  tufts(root, scatter(2016, 120, 0.7, 1.2, offRoad(0.9)))
  tufts(root, clusters(2017, 14, 12, 2, 0.8, 1.3, offRoad(0.9)))
  shrubs(root, clusters(2018, 0, 5, 2.4, 0.6, 1.0, free, [[5, 33], [17, 37], [8, 37.6], [13, 41.5], [43.5, 17.5], [36.5, 18], [44, 36]]))
  shrubs(root, scatter(2019, 14, 0.6, 1.0, (x, z) => edgeward(8)(x, z) && free(x, z)))
  logs(root, scatter(2023, 5, 0.8, 1.1, offRoad(1.6)), M.woodDark)
  stumps(root, clusters(2024, 0, 4, 1.5, 0.7, 1.0, offRoad(1.4), [[16, 5.5], [42, 29]]))
  mushrooms(root, clusters(2025, 0, 5, 1.2, 0.8, 1.1, offRoad(1.2), [[3.8, 27.5], [44, 44], [17.5, 4]]))
  branches(root, clusters(2026, 0, 5, 2, 0.7, 1.2, offRoad(1.0), [[34, 13.5], [3.5, 27], [45, 31]]))
  rocks(root, scatter(2027, 50, 0.12, 0.3, offRoad(0.6)))
  // the verges: long grass, flowers and stones along both sides of the road, a hedge where it bends
  tufts(root, scatter(2028, 140, 0.8, 1.3, verge(0.7, 2.2)))
  flowers(root, scatter(2029, 90, 0.6, 1.0, verge(0.6, 1.8)))
  rocks(root, scatter(2031, 30, 0.12, 0.28, verge(0.5, 1.4)))
  shrubs(root, clusters(2032, 0, 6, 1.6, 0.6, 1.0, verge(1.4, 3), [[28, 24], [35, 28.4], [21.2, 20], [26, 34]]))
  cairn(root, 26.4, 23)
  const g = new GB()
  barrel(g, 25.6, 9.2)
  crate(g, 26.6, 9.6, 0.5)
  sack(g, 25.8, 10.2)
  // ash swept off the road into heaps at its side, every few steps
  ashHeaps(g, "south-meadow", 3101)
  root.add(g.build())
  // the slimes and hares here are the meadow's creatures (core/monsters.ts), drawn by the scene
}

function dunes(root: THREE.Group) {
  rustedMachine(root, 34, 33)
  rustedMachine(root, 12, 12)
  tufts(root, scatter(2021, 200, 0.6, 1.1, offRoad(0.8)))
  deadTrees(root, scatter(2022, 10, 0.8, 1.2, offRoad(2)))
  rocks(root, scatter(2023, 18, 0.3, 1.0, offRoad(1.2)), M.rockDark)
  // stakes along the road so travellers keep to it when the sand blows
  const st: Spot[] = []
  for (let t = 0; t < 1; t += 0.05) {
    const pts = LAYOUTS["red-dunes"].roads[0].pts,
      k = Math.floor(t * (pts.length - 1))
    const [x, z] = pts[k]
    st.push({ x: x + 1.3, z: z + 0.4, s: 1, r: t * 9 })
  }
  instanced(root, trunkGeo, M.woodDark, st, (s) => [
    [s.x, s.z],
    [0.06, s.r, 0],
    [0.45, 1.1, 0.45],
  ])
}

function cliff(root: THREE.Group) {
  brokenTower(root, 30.5, 24)
  pines(
    root,
    scatter(2031, 40, 0.8, 1.2, (x, z) => x < 20 && offRoad(2)(x, z)),
  )
  rocks(root, scatter(2032, 40, 0.4, 1.2, offRoad(1.2)), M.rockDark)
  tufts(root, scatter(2033, 140, 0.6, 1.1, offRoad(0.9)))
  deadTrees(
    root,
    scatter(2034, 6, 0.8, 1.1, (x, z) => x > 26 && offRoad(2)(x, z)),
  )
  // a low fence on the sea side of the road, stopping short of the tower
  const pts = LAYOUTS["sea-cliff"].roads[0].pts.filter((_, i) => i % 3 === 0).map(([x, z]) => [x + 2.2, z] as V2)
  fence(
    root,
    pts.filter(([, z]) => z > 27.5),
    [],
    0.55,
  )
  fence(
    root,
    pts.filter(([, z]) => z < 20.5),
    [],
    0.55,
  )
}

function sheds(root: THREE.Group) {
  netShed(root, 28, 27, 0.1)
  netShed(root, 28.5, 35, -0.05)
  boat(root, 35.5, 29, 1.4)
  boat(root, 36.4, 33.5, 1.7)
  boat(root, 34.8, 38, 1.5)
  dryingRack(root, 31.6, 24.6)
  dryingRack(root, 31.8, 39.4)
  places.netRack = [31.6, 25.6] // where Jacob works before dawn
  const g = new GB()
  barrel(g, 30.4, 29.4)
  barrel(g, 30.8, 30)
  crate(g, 30.2, 33.2, 0.55)
  crate(g, 30.6, 33.8, 0.45)
  sack(g, 31, 32.4)
  root.add(g.build())
  signboard(root, 22.2, 31.2, BOARDS.netShed, 0.1)
  rocks(
    root,
    scatter(2041, 26, 0.3, 1.0, (x, z) => offRoad(1.2)(x, z)),
    M.rockDark,
  )
  tufts(
    root,
    scatter(2042, 120, 0.6, 1.1, (x, z) => x < 28 && offRoad(0.9)(x, z)),
  )
  pines(
    root,
    scatter(2043, 26, 0.8, 1.2, (x, z) => x < 18 && offRoad(2)(x, z)),
  )
}

function forestEdge(root: THREE.Group) {
  // Josef's clearing: stumps, stacked trunks, a chopping block and the charcoal mound
  charcoalKiln(root, 16, 26)
  places.kiln = [17.6, 27.4] // where Josef tends the fire
  const g = new GB()
  woodpile(g, 20, 27.5, 2.2, 4, true)
  woodpile(g, 12.6, 20.7, 1.6, 3, false)
  ashHeaps(g, "forest-edge", 3102)
  root.add(g.build())
  logs(root, [
    { x: 14, z: 29.6, s: 1, r: 0.2 },
    { x: 14.3, z: 30.3, s: 0.9, r: 0.15 },
  ])
  stumps(
    root,
    scatter(2051, 16, 0.8, 1.2, (x, z) => Math.hypot(x - 16, z - 26) < 7 && offRoad(1.2)(x, z)),
  )
  signboard(root, 21.6, 24.2, BOARDS.kilns, 0.3)
  pines(
    root,
    scatter(2052, 260, 0.9, 1.4, (x, z) => Math.hypot(x - 16, z - 26) > 7.5 && offRoad(1.8)(x, z)),
  )
  broadleaves(
    root,
    scatter(2053, 20, 0.8, 1.1, (x, z) => x > 32 && offRoad(2)(x, z)),
    M.autumn,
  )
  rocks(root, scatter(2054, 20, 0.3, 0.8, offRoad(1.2)), M.rockDark)
  tufts(root, scatter(2055, 60, 0.6, 1.0, offRoad(0.9)))
  // the wood's edge: undergrowth between the pines, what the axe left lying, toadstools in the shade
  shrubs(
    root,
    scatter(2056, 40, 0.7, 1.2, (x, z) => Math.hypot(x - 16, z - 26) > 8 && offRoad(1.6)(x, z)),
  )
  branches(root, scatter(2057, 30, 0.7, 1.2, offRoad(1.0)))
  mushrooms(
    root,
    scatter(2058, 18, 0.8, 1.1, (x, z) => Math.hypot(x - 16, z - 26) > 8 && offRoad(1.2)(x, z)),
  )
  rocks(root, scatter(2059, 30, 0.15, 0.35, offRoad(0.8)), M.rockDark)
}

/** Ash swept to the side of the first road in heaps, at intervals (things.ts). */
function ashHeaps(gb: GB, map: string, seed: number) {
  const pts = LAYOUTS[map].roads[0].pts
  for (let k = 3; k < pts.length - 3; k += 5) {
    const [x, z] = pts[k],
      [nx, nz] = pts[k + 1]
    const len = Math.hypot(nx - x, nz - z) || 1
    const side = (k / 5) % 2 ? 1 : -1
    const px = x - ((nz - z) / len) * 1.5 * side,
      pz = z + ((nx - x) / len) * 1.5 * side
    if (roadD(px, pz) > 0.4 && isFree(px, pz)) THINGS["ash-heap"].build(gb, px, pz, seed + k, true)
  }
}

function deepForest(root: THREE.Group) {
  ruinedWall(
    root,
    [
      [6, 34],
      [14, 32.6],
      [19, 33.4],
    ],
    61,
  )
  ruinedWall(
    root,
    [
      [29, 14],
      [36, 12.6],
      [42, 14.4],
    ],
    62,
  )
  pines(root, scatter(2061, 230, 1.0, 1.7, offRoad(1.6)), false)
  logs(root, scatter(2062, 18, 0.8, 1.3, offRoad(1.6)), M.woodDark)
  mushrooms(root, scatter(2063, 40, 0.8, 1.2, offRoad(1.0)))
  rocks(root, scatter(2064, 26, 0.4, 1.1, offRoad(1.2)), M.rockDark)
  stumps(root, scatter(2065, 10, 0.8, 1.2, offRoad(1.2)))
  // ferns and dead grass between the trunks, where the light gets through
  tufts(root, scatter(2066, 140, 0.6, 1.0, offRoad(0.9)))
  // the deep wood's floor: thick undergrowth, a litter of fallen branches, mossy stones
  shrubs(root, scatter(2067, 60, 0.8, 1.3, offRoad(1.5)))
  branches(root, scatter(2068, 50, 0.7, 1.3, offRoad(1.0)))
  rocks(root, scatter(2069, 40, 0.15, 0.4, offRoad(0.8)), M.rockDark)
}

function quynhonGate(root: THREE.Group) {
  cityWall(root, 10.5, 24, false)
  signboard(root, 19.4, 33.6, BOARDS.crossroads, 0.4)
  pines(
    root,
    scatter(2071, 34, 0.8, 1.2, (x, z) => z > 16 && x < 34 && offRoad(2)(x, z)),
  )
  rocks(
    root,
    scatter(2072, 24, 0.3, 0.9, (x, z) => z > 13 && offRoad(1.2)(x, z)),
  )
  tufts(
    root,
    scatter(2073, 120, 0.6, 1.1, (x, z) => z > 12 && offRoad(0.9)(x, z)),
  )
  const g = new GB()
  crate(g, 28.6, 14.4, 0.6)
  crate(g, 29.2, 15.1, 0.5)
  barrel(g, 19.4, 14.2)
  sack(g, 28.4, 15.6)
  root.add(g.build())
}

function pass(root: THREE.Group) {
  cairn(root, 30.8, 20.8)
  emptyShrine(root, 20.6, 12)
  rocks(root, scatter(2081, 60, 0.4, 1.4, offRoad(1.4)), M.rockDark)
  pines(root, scatter(2082, 50, 0.7, 1.1, offRoad(2.5)))
  tufts(root, scatter(2083, 120, 0.6, 1.0, offRoad(0.9)))
  deadTrees(root, scatter(2084, 8, 0.8, 1.2, offRoad(2)))
}

function hueGate(root: THREE.Group) {
  cityWall(root, 10.5, 24, true)
  pines(
    root,
    scatter(2091, 40, 0.8, 1.2, (x, z) => z > 16 && offRoad(2)(x, z)),
  )
  rocks(
    root,
    scatter(2092, 30, 0.3, 1.0, (x, z) => z > 13 && offRoad(1.2)(x, z)),
    M.rockDark,
  )
  tufts(
    root,
    scatter(2093, 120, 0.6, 1.0, (x, z) => z > 12 && offRoad(0.9)(x, z)),
  )
}

/** Trees (or, in the dunes, dead trees and stones) thick on the rim, closing the view at the edges. */
function rim(root: THREE.Group, id: string, seed: number) {
  const ok = (x: number, z: number) => edgeward(3.5)(x, z) && offRoad(2.2)(x, z) && !(OPEN_SIDES[id]?.includes("e") && x > 30)
  if (id === "red-dunes") {
    deadTrees(root, scatter(seed, 24, 0.9, 1.4, ok))
    rocks(root, scatter(seed + 1, 60, 0.6, 1.6, ok), M.rockDark)
    return
  }
  pines(root, scatter(seed, 150, 0.9, 1.5, ok), id !== "deep-forest")
}

const BUILDERS: Record<string, (root: THREE.Group) => void> = {
  "south-meadow": meadow,
  "red-dunes": dunes,
  "sea-cliff": cliff,
  "net-sheds": sheds,
  "forest-edge": forestEdge,
  "deep-forest": deepForest,
  "quynhon-gate": quynhonGate,
  "mountain-pass": pass,
  "hue-gate": hueGate,
}

export const FIELD_BUILDERS: Record<string, (root: THREE.Group) => void> = Object.fromEntries(
  Object.entries(BUILDERS).map(([id, b], i) => [
    id,
    (root: THREE.Group) => {
      b(root)
      rim(root, id, 3000 + i * 10)
    },
  ]),
)

void updaters
