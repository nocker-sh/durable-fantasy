import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { THINGS } from "#/world/scene/props/catalog"
import { M } from "#/world/scene/construction/materials"
import { barrel } from "#/world/scene/construction/barrel"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { woodpile } from "#/world/scene/construction/woodpile"
import { fence } from "#/world/scene/construction/fence"
import { updaters, places } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"
import { isFree } from "#/world/scene/is-free"
import { roadD } from "#/world/scene/road-d"
import { LAYOUTS, OPEN_SIDES } from "../../maps/ground-layouts"
import { orchard } from "#/world/scene/fields/orchard"
import { vineyard } from "#/world/scene/fields/vineyard"
import { signboard } from "#/world/scene/fields/signboard"
import { cairn } from "#/world/scene/fields/cairn"
import { rustedMachine } from "#/world/scene/fields/rusted-machine"
import { brokenTower } from "#/world/scene/fields/broken-tower"
import { netShed } from "#/world/scene/fields/net-shed"
import { boat } from "#/world/scene/fields/boat"
import { dryingRack } from "#/world/scene/fields/drying-rack"
import { charcoalKiln } from "#/world/scene/fields/charcoal-kiln"
import { ruinedWall } from "#/world/scene/fields/ruined-wall"
import { cityWall } from "#/world/scene/fields/city-wall"
import { emptyShrine } from "#/world/scene/fields/empty-shrine"
import { broadleaves } from "#/world/scene/fields/broadleaves"
import { rocks } from "#/world/scene/fields/rocks"
import { pines } from "#/world/scene/fields/pines"
import { tufts } from "#/world/scene/fields/tufts"
import { logs } from "#/world/scene/fields/logs"
import { stumps } from "#/world/scene/fields/stumps"
import { mushrooms } from "#/world/scene/fields/mushrooms"
import { shrubs } from "#/world/scene/fields/shrubs"
import { branches } from "#/world/scene/fields/branches"
import { deadTrees } from "#/world/scene/fields/dead-trees"
import { trunkGeo } from "#/world/scene/fields/vegetation"
import { scatter } from "#/world/scene/fields/helpers/scatter/scatter"
import { edgeward } from "#/world/scene/fields/helpers/scatter/edgeward"
import { offRoad } from "#/world/scene/fields/helpers/scatter/off-road"
import { type Spot, instanced } from "./instancing"

// ---------------------------------------------------------------- builders
function meadow(root: THREE.Group) {
  orchard({ root: root, x0: 6, z0: 8, cols: 4, rows: 3 })
  vineyard({ root: root, x0: 6, z0: 16, rows: 3, len: 7 })
  signboard({ root: root, x: 26.2, z: 6.4, lines: ["オットーの果樹園"], rot: 0.2 })
  // a lone old tree on the hill, the meadow's landmark
  broadleaves(root, [{ x: 34, z: 13, s: 1.6, r: 0.4 }], M.leaf)
  rocks(root, [
    { x: 35.6, z: 14.2, s: 0.8, r: 1 },
    { x: 32.8, z: 14.4, s: 0.5, r: 2 },
  ])
  // Vegetation at the meadow edge; the proposed damp habitat is not an implemented pond.
  broadleaves(root, scatter({ seed: 2011, count: 26, s0: 0.7, s1: 1.1, ok: (x, z) => edgeward(5)(x, z) && offRoad(2)(x, z) }), M.leaf2)
  pines(root, scatter({ seed: 2012, count: 14, s0: 0.8, s1: 1.1, ok: (x, z) => edgeward(3)(x, z) && offRoad(2)(x, z) }))
  rocks(root, scatter({ seed: 2013, count: 30, s0: 0.3, s1: 0.9, ok: offRoad(1.2) }))
  tufts(root, scatter({ seed: 2014, count: 160, s0: 0.7, s1: 1.2, ok: offRoad(0.9) }))
  // the meadow left to itself: fallen trunks gone to moss, old stumps, toadstools at the wood's edge
  logs(root, scatter({ seed: 2015, count: 7, s0: 0.8, s1: 1.1, ok: offRoad(1.6) }), M.woodDark)
  stumps(root, scatter({ seed: 2016, count: 9, s0: 0.7, s1: 1.0, ok: offRoad(1.4) }))
  mushrooms(root, scatter({ seed: 2017, count: 12, s0: 0.8, s1: 1.1, ok: (x, z) => edgeward(7)(x, z) && offRoad(1.2)(x, z) }))
  // shrubs along the field edges, branches fallen from the old trees, loose stones
  shrubs(root, scatter({ seed: 2018, count: 34, s0: 0.6, s1: 1.1, ok: (x, z) => edgeward(9)(x, z) && offRoad(1.5)(x, z) }))
  branches(root, scatter({ seed: 2019, count: 18, s0: 0.7, s1: 1.2, ok: offRoad(1.0) }))
  rocks(root, scatter({ seed: 2020, count: 40, s0: 0.15, s1: 0.35, ok: offRoad(0.8) }))
  // a cairn where the path to the dunes leaves the road
  cairn(root, 25.6, 30.6)
  const g = new GB()
  barrel({ gb: g, x: 25.6, z: 9.2 })
  crate({ gb: g, x: 26.6, z: 9.6, s: 0.5 })
  sack({ gb: g, x: 25.8, z: 10.2 })
  // ash swept off the road into heaps at its side, every few steps
  ashHeaps(g, "south-meadow", 3101)
  root.add(g.build())
  // slimes in the open grass south of the orchard, hares near the woods
  // the slimes and hares here are the meadow's creatures (core/monsters.ts), drawn by the scene
}

function dunes(root: THREE.Group) {
  rustedMachine(root, 34, 33)
  rustedMachine(root, 12, 12)
  tufts(root, scatter({ seed: 2021, count: 200, s0: 0.6, s1: 1.1, ok: offRoad(0.8) }))
  deadTrees(root, scatter({ seed: 2022, count: 10, s0: 0.8, s1: 1.2, ok: offRoad(2) }))
  rocks(root, scatter({ seed: 2023, count: 18, s0: 0.3, s1: 1.0, ok: offRoad(1.2) }), M.rockDark)
  // stakes along the road so travellers keep to it when the sand blows
  const st: Spot[] = []
  for (let t = 0; t < 1; t += 0.05) {
    const pts = LAYOUTS["red-dunes"].roads[0].pts,
      k = Math.floor(t * (pts.length - 1))
    const xState = pts[k],
      x = xState[0],
      z = xState[1]
    st.push({ x: x + 1.3, z: z + 0.4, s: 1, r: t * 9 })
  }
  instanced({
    root: root,
    geo: trunkGeo,
    material: M.woodDark,
    spots: st,
    place: (s) => [
      [s.x, s.z],
      [0.06, s.r, 0],
      [0.45, 1.1, 0.45],
    ],
  })
}

function cliff(root: THREE.Group) {
  brokenTower(root, 30.5, 24)
  pines(root, scatter({ seed: 2031, count: 40, s0: 0.8, s1: 1.2, ok: (x, z) => x < 20 && offRoad(2)(x, z) }))
  rocks(root, scatter({ seed: 2032, count: 40, s0: 0.4, s1: 1.2, ok: offRoad(1.2) }), M.rockDark)
  tufts(root, scatter({ seed: 2033, count: 140, s0: 0.6, s1: 1.1, ok: offRoad(0.9) }))
  deadTrees(root, scatter({ seed: 2034, count: 6, s0: 0.8, s1: 1.1, ok: (x, z) => x > 26 && offRoad(2)(x, z) }))
  // a low fence on the sea side of the road, stopping short of the tower
  const pts = LAYOUTS["sea-cliff"].roads[0].pts
    .filter((_, i) => i % 3 === 0)
    .map((entry) => {
      const x = entry[0]
      const z = entry[1]
      return [x + 2.2, z] as V2
    })
  fence({
    root: root,
    pts: pts.filter((entry2) => {
      const z = entry2[1]
      return z > 27.5
    }),
    gaps: [],
    h: 0.55,
  })
  fence({
    root: root,
    pts: pts.filter((entry3) => {
      const z = entry3[1]
      return z < 20.5
    }),
    gaps: [],
    h: 0.55,
  })
}

function sheds(root: THREE.Group) {
  netShed({ root: root, x: 28, z: 27, rot: 0.1 })
  netShed({ root: root, x: 28.5, z: 35, rot: -0.05 })
  boat({ root: root, x: 35.5, z: 29, rot: 1.4 })
  boat({ root: root, x: 36.4, z: 33.5, rot: 1.7 })
  boat({ root: root, x: 34.8, z: 38, rot: 1.5 })
  dryingRack(root, 31.6, 24.6)
  dryingRack(root, 31.8, 39.4)
  places.netRack = [31.6, 25.6] // where Jacob works before dawn
  const g = new GB()
  barrel({ gb: g, x: 30.4, z: 29.4 })
  barrel({ gb: g, x: 30.8, z: 30 })
  crate({ gb: g, x: 30.2, z: 33.2, s: 0.55 })
  crate({ gb: g, x: 30.6, z: 33.8, s: 0.45 })
  sack({ gb: g, x: 31, z: 32.4 })
  root.add(g.build())
  signboard({ root: root, x: 22.2, z: 31.2, lines: ["ヤコブの網小屋"], rot: 0.1 })
  rocks(root, scatter({ seed: 2041, count: 26, s0: 0.3, s1: 1.0, ok: (x, z) => offRoad(1.2)(x, z) }), M.rockDark)
  tufts(root, scatter({ seed: 2042, count: 120, s0: 0.6, s1: 1.1, ok: (x, z) => x < 28 && offRoad(0.9)(x, z) }))
  pines(root, scatter({ seed: 2043, count: 26, s0: 0.8, s1: 1.2, ok: (x, z) => x < 18 && offRoad(2)(x, z) }))
}

function forestEdge(root: THREE.Group) {
  // Josef's clearing: stumps, stacked trunks, a chopping block and the charcoal mound
  charcoalKiln(root, 16, 26)
  places.kiln = [17.6, 27.4] // where Josef tends the fire
  const g = new GB()
  woodpile({ gb: g, x: 20, z: 27.5, len: 2.2, layers: 4, alongX: true })
  woodpile({ gb: g, x: 12.6, z: 20.7, len: 1.6, layers: 3, alongX: false })
  ashHeaps(g, "forest-edge", 3102)
  root.add(g.build())
  logs(root, [
    { x: 14, z: 29.6, s: 1, r: 0.2 },
    { x: 14.3, z: 30.3, s: 0.9, r: 0.15 },
  ])
  stumps(root, scatter({ seed: 2051, count: 16, s0: 0.8, s1: 1.2, ok: (x, z) => Math.hypot(x - 16, z - 26) < 7 && offRoad(1.2)(x, z) }))
  signboard({ root: root, x: 21.6, z: 24.2, lines: ["ヨーゼフの炭焼き場"], rot: 0.3 })
  pines(root, scatter({ seed: 2052, count: 260, s0: 0.9, s1: 1.4, ok: (x, z) => Math.hypot(x - 16, z - 26) > 7.5 && offRoad(1.8)(x, z) }))
  broadleaves(root, scatter({ seed: 2053, count: 20, s0: 0.8, s1: 1.1, ok: (x, z) => x > 32 && offRoad(2)(x, z) }), M.autumn)
  rocks(root, scatter({ seed: 2054, count: 20, s0: 0.3, s1: 0.8, ok: offRoad(1.2) }), M.rockDark)
  tufts(root, scatter({ seed: 2055, count: 60, s0: 0.6, s1: 1.0, ok: offRoad(0.9) }))
  // the wood's edge: undergrowth between the pines, what the axe left lying, toadstools in the shade
  shrubs(root, scatter({ seed: 2056, count: 40, s0: 0.7, s1: 1.2, ok: (x, z) => Math.hypot(x - 16, z - 26) > 8 && offRoad(1.6)(x, z) }))
  branches(root, scatter({ seed: 2057, count: 30, s0: 0.7, s1: 1.2, ok: offRoad(1.0) }))
  mushrooms(root, scatter({ seed: 2058, count: 18, s0: 0.8, s1: 1.1, ok: (x, z) => Math.hypot(x - 16, z - 26) > 8 && offRoad(1.2)(x, z) }))
  rocks(root, scatter({ seed: 2059, count: 30, s0: 0.15, s1: 0.35, ok: offRoad(0.8) }), M.rockDark)
}

/** Ash swept to the side of the first road in heaps, at intervals (things.ts). */
function ashHeaps(gb: GB, map: string, seed: number) {
  const pts = LAYOUTS[map].roads[0].pts
  for (let k = 3; k < pts.length - 3; k += 5) {
    const xState2 = pts[k],
      x = xState2[0],
      z = xState2[1],
      nxState = pts[k + 1],
      nx = nxState[0],
      nz = nxState[1]
    const len = Math.hypot(nx - x, nz - z) || 1
    const side = (k / 5) % 2 ? 1 : -1
    const px = x - ((nz - z) / len) * 1.5 * side,
      pz = z + ((nx - x) / len) * 1.5 * side
    if (roadD(px, pz) > 0.4 && isFree(px, pz)) THINGS["ash-heap"].build({ builder: gb, x: px, z: pz, seed: seed + k, along: true })
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
  pines(root, scatter({ seed: 2061, count: 230, s0: 1.0, s1: 1.7, ok: offRoad(1.6) }), false)
  logs(root, scatter({ seed: 2062, count: 18, s0: 0.8, s1: 1.3, ok: offRoad(1.6) }), M.woodDark)
  mushrooms(root, scatter({ seed: 2063, count: 40, s0: 0.8, s1: 1.2, ok: offRoad(1.0) }))
  rocks(root, scatter({ seed: 2064, count: 26, s0: 0.4, s1: 1.1, ok: offRoad(1.2) }), M.rockDark)
  stumps(root, scatter({ seed: 2065, count: 10, s0: 0.8, s1: 1.2, ok: offRoad(1.2) }))
  // ferns and dead grass between the trunks, where the light gets through
  tufts(root, scatter({ seed: 2066, count: 140, s0: 0.6, s1: 1.0, ok: offRoad(0.9) }))
  // the deep wood's floor: thick undergrowth, a litter of fallen branches, mossy stones
  shrubs(root, scatter({ seed: 2067, count: 60, s0: 0.8, s1: 1.3, ok: offRoad(1.5) }))
  branches(root, scatter({ seed: 2068, count: 50, s0: 0.7, s1: 1.3, ok: offRoad(1.0) }))
  rocks(root, scatter({ seed: 2069, count: 40, s0: 0.15, s1: 0.4, ok: offRoad(0.8) }), M.rockDark)
}

function quynhonGate(root: THREE.Group) {
  cityWall({ root: root, z: 10.5, gx: 24, chimneysBehind: false })
  signboard({ root: root, x: 19.4, z: 33.6, lines: ["南 峠道", "西 樹海", "北 クイニョン"], rot: 0.4 })
  pines(root, scatter({ seed: 2071, count: 34, s0: 0.8, s1: 1.2, ok: (x, z) => z > 16 && x < 34 && offRoad(2)(x, z) }))
  rocks(root, scatter({ seed: 2072, count: 24, s0: 0.3, s1: 0.9, ok: (x, z) => z > 13 && offRoad(1.2)(x, z) }))
  tufts(root, scatter({ seed: 2073, count: 120, s0: 0.6, s1: 1.1, ok: (x, z) => z > 12 && offRoad(0.9)(x, z) }))
  const g = new GB()
  crate({ gb: g, x: 28.6, z: 14.4, s: 0.6 })
  crate({ gb: g, x: 29.2, z: 15.1, s: 0.5 })
  barrel({ gb: g, x: 19.4, z: 14.2 })
  sack({ gb: g, x: 28.4, z: 15.6 })
  root.add(g.build())
}

function pass(root: THREE.Group) {
  cairn(root, 30.8, 20.8)
  emptyShrine(root, 20.6, 12)
  rocks(root, scatter({ seed: 2081, count: 60, s0: 0.4, s1: 1.4, ok: offRoad(1.4) }), M.rockDark)
  pines(root, scatter({ seed: 2082, count: 50, s0: 0.7, s1: 1.1, ok: offRoad(2.5) }))
  tufts(root, scatter({ seed: 2083, count: 120, s0: 0.6, s1: 1.0, ok: offRoad(0.9) }))
  deadTrees(root, scatter({ seed: 2084, count: 8, s0: 0.8, s1: 1.2, ok: offRoad(2) }))
}

function hueGate(root: THREE.Group) {
  cityWall({ root: root, z: 10.5, gx: 24, chimneysBehind: true })
  pines(root, scatter({ seed: 2091, count: 40, s0: 0.8, s1: 1.2, ok: (x, z) => z > 16 && offRoad(2)(x, z) }))
  rocks(root, scatter({ seed: 2092, count: 30, s0: 0.3, s1: 1.0, ok: (x, z) => z > 13 && offRoad(1.2)(x, z) }), M.rockDark)
  tufts(root, scatter({ seed: 2093, count: 120, s0: 0.6, s1: 1.0, ok: (x, z) => z > 12 && offRoad(0.9)(x, z) }))
}

/** Trees (or, in the dunes, dead trees and stones) thick on the rim, closing the view at the edges. */
function rim(root: THREE.Group, id: string, seed: number) {
  const ok = (x: number, z: number) => edgeward(3.5)(x, z) && offRoad(2.2)(x, z) && !(OPEN_SIDES[id]?.includes("e") && x > 30)
  if (id === "red-dunes") {
    deadTrees(root, scatter({ seed: seed, count: 24, s0: 0.9, s1: 1.4, ok: ok }))
    rocks(root, scatter({ seed: seed + 1, count: 60, s0: 0.6, s1: 1.6, ok: ok }), M.rockDark)
    return
  }
  pines(root, scatter({ seed: seed, count: 150, s0: 0.9, s1: 1.5, ok: ok }), id !== "deep-forest")
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
  Object.entries(BUILDERS).map((entry4, i) => {
    const id = entry4[0]
    const b = entry4[1]
    return [
      id,
      (root: THREE.Group) => {
        b(root)
        rim(root, id, 3000 + i * 10)
      },
    ]
  }),
)

void updaters
