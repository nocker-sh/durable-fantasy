// The ground plans (world.ts Layout) of the districts beyond the square, the fields and the
// rooms: data and landforms only, with nothing drawn, so the workers that paint the ground can
// load them without the scene.
import { OFF, OFF_LINE, OFF_POINT, catmull, smooth, type Layout } from "./layout.ts"
import { fbm } from "../../lib/engine/noise.ts"

const N = 48

type V2 = [number, number]

const none = OFF
const base: Omit<Layout, "roads" | "plaza" | "plazaR" | "town" | "seed"> = {
  river: OFF_LINE,
  riverHW: 1.6,
  embanked: [0, 48],
  terrace: none,
  stairs: none,
  lavoir: none,
  lavStairs: none,
  bridge: none,
  fields: [],
  pigpen: none,
  pasture: none,
  graveyard: none,
  gardens: [],
  dirtPatches: [],
  relief: [0.6, 1.4],
}

// ---------------------------------------------------------------- the shopping street
export const MARKET: Layout = {
  ...base,
  roads: [
    {
      pts: catmull([
        [-3, 24],
        [10, 24],
        [24, 24.2],
        [38, 24.2],
        [51, 25],
      ]),
      w: 1.25,
      kind: "cobble",
    },
    {
      pts: catmull([
        [24, 24],
        [24, 15],
        [24.5, 8],
      ]),
      w: 0.8,
      kind: "pave",
    },
    // south between the night stalls, down to the west fields
    {
      pts: catmull([
        [17.9, 25],
        [17.9, 34],
        [18.3, 44],
        [18.5, 51],
      ]),
      w: 0.7,
      kind: "dirt",
    },
    // the back alley behind the north row: washing, barrels, the kitchen doors
    {
      pts: catmull([
        [1.5, 16],
        [12, 15.9],
        [24, 16],
        [36, 16.05],
        [45.5, 16],
      ]),
      w: 0.5,
      kind: "pave",
    },
  ],
  plaza: [24, 24],
  plazaR: 3.6,
  town: [24, 24, 20, 14],
  seed: 11,
}

// ---------------------------------------------------------------- the craftsmen's lane
export const CRAFT: Layout = {
  ...base,
  roads: [
    {
      pts: catmull([
        [-3, 23],
        [8, 23.4],
        [20, 23],
        [30, 22.6],
        [40, 23],
      ]),
      w: 1.1,
      kind: "cobble",
    },
    {
      pts: catmull([
        [20, 23],
        [19.6, 32],
        [20, 40],
      ]),
      w: 0.85,
      kind: "dirt",
    },
  ],
  plaza: OFF_POINT,
  plazaR: 0,
  dirtPatches: [
    [14, 25, 19, 29],
    [24, 25, 29, 28.6],
    [11.1, 17.2, 12.6, 20.6],
  ],
  town: [20, 24, 18, 14],
  seed: 13,
}

// ---------------------------------------------------------------- the south gate
export const GATE: Layout = {
  ...base,
  roads: [
    {
      pts: catmull([
        [19.2, -3],
        [20.2, 6],
        [23.2, 14],
        [24.2, 24],
        [24, 38],
        [24, 51],
      ]),
      w: 1.15,
      kind: "cobble",
    },
    // the lane west between the hunter's and the teacher's houses, on out to the west fields
    {
      pts: catmull([
        [23.6, 22.2],
        [16, 21.8],
        [9, 22.1],
        [2.5, 22],
        [-3, 22],
      ]),
      w: 0.55,
      kind: "dirt",
    },
  ],
  plaza: [24, 18],
  plazaR: 3.2,
  gardens: [{ x0: 13, z0: 10, x1: 17, z1: 13 }], // the guards' vegetable patch behind the guardhouse
  town: [24, 20, 16, 16],
  seed: 17,
}

// ---------------------------------------------------------------- the west fields
// The tenant farms west of the gate and south of the shopping street: rye and vegetables, the
// dairy's pasture and the butcher's sties, one lane down from the street and one across to the gate.
export const FIELDS: Layout = {
  ...base,
  roads: [
    {
      pts: catmull([
        [18.5, -3],
        [18.6, 8],
        [19.2, 16],
        [20.2, 21],
        [21, 22.2],
      ]),
      w: 0.8,
      kind: "dirt",
    },
    {
      pts: catmull([
        [21, 22.2],
        [30, 22.4],
        [40, 22.1],
        [51, 22],
      ]),
      w: 0.85,
      kind: "dirt",
    },
    // the farm lane west to the tenants' doors
    {
      pts: catmull([
        [21, 22.2],
        [14, 23.2],
        [7, 23],
        [2.5, 22.6],
      ]),
      w: 0.55,
      kind: "dirt",
    },
    // down to the pasture
    {
      pts: catmull([
        [21, 22.2],
        [21.6, 30],
        [22.4, 37],
      ]),
      w: 0.55,
      kind: "dirt",
    },
  ],
  plaza: OFF_POINT,
  plazaR: 0,
  fields: [
    { x0: 2.5, z0: 3, x1: 15, z1: 14, axis: "x" },
    { x0: 24, z0: 4, x1: 36, z1: 14.5, axis: "z" },
    { x0: 3, z0: 29, x1: 16.5, z1: 43, axis: "x" },
    { x0: 26, z0: 28.5, x1: 37, z1: 35, axis: "z" },
  ],
  pigpen: { x0: 40.5, z0: 26, x1: 45, z1: 30 },
  pasture: { x0: 29, z0: 38, x1: 44, z1: 45.5 },
  dirtPatches: [
    [16.6, 24.4, 19.6, 27], // round the well
    [38, 24.4, 40.2, 30], // the butcher's yard by the sties
  ],
  town: [22, 22, 20, 18],
  seed: 19,
  relief: [0.5, 1.2],
}

/** Flat ground with nothing on it: the room is all there is. */
export const INDOOR: Layout = {
  river: OFF_LINE,
  riverHW: 1.6,
  embanked: [0, 48],
  roads: [],
  plaza: OFF_POINT,
  plazaR: 0,
  terrace: OFF,
  stairs: OFF,
  lavoir: OFF,
  lavStairs: OFF,
  bridge: OFF,
  fields: [],
  pigpen: OFF,
  pasture: OFF,
  graveyard: OFF,
  gardens: [],
  dirtPatches: [],
  town: [24, 24, 40, 40],
  seed: 1,
  relief: [0, 0],
}

// ---------------------------------------------------------------- ground
const open: Omit<Layout, "roads" | "seed" | "relief" | "biome" | "shape" | "fog"> = {
  river: OFF_LINE,
  riverHW: 1.6,
  embanked: [0, 48],
  plaza: OFF_POINT,
  plazaR: 0,
  terrace: OFF,
  stairs: OFF,
  lavoir: OFF,
  lavStairs: OFF,
  bridge: OFF,
  fields: [],
  pigpen: OFF,
  pasture: OFF,
  graveyard: OFF,
  gardens: [],
  dirtPatches: [],
  town: [24, 24, 2, 2],
}
const dirt = (pts: V2[], w = 0.85) => ({ pts: catmull(pts), w, kind: "dirt" as const })
/** ground that falls into the sea east of `x0` over `width` tiles */
const seaward =
  (x0: number, width: number, depth = 2.4) =>
  (x: number, z: number, h: number) =>
    h - smooth(x0, x0 + width, x + (fbm(x, z, 0.15, 7) - 0.5) * 3) * depth

// ---------------------------------------------------------------- landforms (landscape.md「地形の作り方」)
/** A rise of `top` over the ground, gentle out to `r`, flat on top inside `flat`. */
const hill = (x: number, z: number, cx: number, cz: number, r: number, flat: number, top: number) => top * smooth(r, flat, Math.hypot(x - cx, z - cz))

/** A hollow dug `depth` below the ground (or down to `floor`, under the water, for a pond), its rim wobbling. */
const hollow = (x: number, z: number, h: number, cx: number, cz: number, r: number, floor: number, seed: number) => {
  const d = Math.hypot(x - cx, z - cz) + (fbm(x, z, 0.35, seed) - 0.5) * 1.6
  // a shelving bank down to the water, then the deep middle
  return h + (floor - h) * smooth(r, r * 0.15, d)
}

/**
 * Old fields cut into steps across a slope: each edge rises `step` over a short, rocky bank (too steep
 * to walk, painted as stone), except where a ramp at `rampX` (± `rampW`) climbs it gently.
 */
const terraced = (x: number, z: number, edges: readonly number[], step: number, rampX: number, rampW: number, seed: number) => {
  const ramp = smooth(rampW + 1, rampW, Math.abs(x - rampX))
  let h = 0
  edges.forEach((e, k) => {
    const at = e + Math.sin(x * 0.45 + k * 1.7 + seed) * 0.6
    const half = 0.16 + ramp * 1.6
    h += step * smooth(at - half, at + half, z)
  })
  return h
}

/** Where the meadow's old terraces run (x from, x to), their edges (z) and the ramp up them: the scene walls their tops. */
export const MEADOW_TERRACES = { x0: 3, x1: 19, edges: [34, 38, 42], step: 0.55, rampX: 11, rampW: 1.1 } as const

/** Hills rising along the map's edges (not on the open sides), so the land seems to go on. */
function rimmed(l: Layout, open = ""): Layout {
  const inner = l.shape
  return {
    ...l,
    shape: (x, z, h, roadD) => {
      const sides: [string, number][] = [
        ["w", x],
        ["n", z],
        ["e", N - x],
        ["s", N - z],
      ]
      let rim = 0
      for (const [k, d] of sides) if (!open.includes(k)) rim = Math.max(rim, smooth(5, 0.5, d + (fbm(x, z, 0.2, 17) - 0.5) * 2))
      return (inner ? inner(x, z, h, roadD) : h) + rim * 2.2
    },
  }
}

export const LAYOUTS: Record<string, Layout> = {
  // the meadow below the south gate: gentle hills, Otto's orchard, slimes in the grass
  "south-meadow": {
    ...open,
    seed: 201,
    relief: [1.4, 1.4],
    biome: "meadow",
    // the lone tree's hill (gentle from the road, a rocky scarp to the north-east), the pond fed by the
    // wet ground east of it, the old terraced fields climbing to the stopped windmill in the south-west,
    // and the hollow where a war engine lies in the grass (landscape.md「マップごとのテーマ」)
    shape: (x, z, h) => {
      const dx = x - 34,
        dz = z - 12.5
      const ne = smooth(-0.2, 0.6, (dx - dz) / (Math.hypot(dx, dz) || 1) / Math.SQRT2)
      const d = Math.hypot(dx, dz)
      h += 1.8 * (smooth(7.5, 2.2, d) * (1 - ne) + smooth(4.3, 3.7, d) * ne)
      const T = MEADOW_TERRACES
      h += terraced(x, z, T.edges, T.step, T.rampX, T.rampW, 3) * smooth(T.x1 + 2, T.x1 - 3, x) * smooth(T.x0 - 3, T.x0, x)
      h -= hill(x, z, 39.5, 37, 4.5, 1.2, 0.7)
      return hollow(x, z, h, 40.5, 19.5, 4.2, -1.35, 31)
    },
    // south from the gate, then east to the edge of the forest; a branch on south to the dunes
    roads: [
      dirt(
        [
          [24, -3],
          [24.6, 8],
          [22.8, 16],
          [24, 24],
          [30, 26],
          [40, 26.2],
          [51, 26],
        ],
        0.95,
      ),
      dirt(
        [
          [24, 24],
          [23, 32],
          [23.6, 40],
          [24.5, 51],
        ],
        0.8,
      ),
    ],
    // worn by feet: into the orchard, up to the lone tree on the hill, and the slimes' ground
    trails: [
      catmull([
        [23.6, 12],
        [18, 11],
        [12, 10.5],
        [8, 9.4],
      ]),
      catmull([
        [25.4, 18],
        [29, 16.5],
        [32.4, 14.6],
        [34, 13.4],
      ]),
      catmull([
        [26, 26.3],
        [30, 30],
        [36, 34],
        [40, 38],
      ]),
    ],
  },
  // red and white dunes: long ridges across the wind, frost on the lee sides
  "red-dunes": {
    ...open,
    seed: 202,
    relief: [0.6, 0.6],
    biome: "dune",
    fog: { color: 0xe0c8b0, near: 10, far: 42 },
    roads: [
      dirt(
        [
          [24.5, -3],
          [25, 8],
          [28, 17],
          [36, 22.5],
          [51, 22],
        ],
        0.8,
      ),
    ],
    shape: (x, z, h) => h + (Math.sin(x * 0.33 + z * 0.12 + fbm(x, z, 0.08, 9) * 4) * 0.5 + 0.5) ** 2 * 1.5,
  },
  // the road along the sea cliffs, the sea to the east
  "sea-cliff": {
    ...open,
    seed: 203,
    relief: [1.0, 1.0],
    biome: "coast",
    fog: { color: 0xc4d2da, near: 12, far: 48 },
    roads: [
      dirt(
        [
          [30, 51],
          [28.4, 40],
          [27, 30],
          [27.6, 20],
          [25.6, 10],
          [24, -3],
        ],
        0.85,
      ),
    ],
    shape: (x, z, h) => {
      const edge = 34 + Math.sin(z * 0.21) * 2 + (fbm(x, z, 0.2, 11) - 0.5) * 2
      return x < edge ? h + smooth(4, 30, x) * 0.6 : h - 2.8 - smooth(edge, edge + 6, x) * 1.2
    },
  },
  // the beach where the net sheds stand, boats pulled up on the sand
  "net-sheds": {
    ...open,
    seed: 204,
    relief: [0.6, 0.6],
    biome: "coast",
    fog: { color: 0xc4d2da, near: 12, far: 48 },
    roads: [
      dirt(
        [
          [24, -3],
          [23.4, 10],
          [20, 23],
          [23, 30],
          [24.4, 40],
          [24, 51],
        ],
        0.85,
      ),
      dirt(
        [
          [20, 23],
          [10, 22],
          [-3, 22],
        ],
        0.8,
      ),
      dirt(
        [
          [23, 30],
          [30, 31],
          [34, 31.4],
        ],
        0.6,
      ),
    ],
    shape: seaward(31, 9),
  },
  // the edge of the great forest, where Josef cuts wood and burns charcoal
  "forest-edge": {
    ...open,
    seed: 205,
    relief: [1.2, 1.2],
    biome: "forest",
    fog: { color: 0x4e5e58, near: 5, far: 30 },
    // in from the meadow on the west, out north into the deep forest, and south to the beach
    roads: [
      dirt(
        [
          [24, 51],
          [25, 40],
          [27, 30],
          [30, 21.4],
          [24, 18],
          [24.4, 8],
          [24, -3],
        ],
        0.8,
      ),
      dirt(
        [
          [30, 21.4],
          [20, 22.4],
          [12, 25.6],
          [4, 26],
          [-3, 26],
        ],
        0.75,
      ),
    ],
    // Josef's way to his kiln, and the deer's runs between the trees
    trails: [
      catmull([
        [20, 22.6],
        [18.4, 25],
        [17, 26.5],
      ]),
      catmull([
        [28, 28],
        [34, 32],
        [40, 31],
        [46, 36],
      ]),
      catmull([
        [25, 12],
        [32, 10],
        [38, 6],
        [44, 4],
      ]),
    ],
  },
  // deep in the forest: moss, fallen trunks, mist, an old wall from the war
  "deep-forest": {
    ...open,
    seed: 206,
    relief: [1.6, 1.6],
    biome: "forest",
    fog: { color: 0x3e4c48, near: 2, far: 20 },
    roads: [
      dirt(
        [
          [24, 51],
          [25, 40],
          [21.6, 32],
          [26, 27],
          [38, 29],
          [51, 30],
        ],
        0.7,
      ),
    ],
    // game trails into the deep wood, one to the old wall
    trails: [
      catmull([
        [22, 33],
        [16, 28],
        [12, 20],
        [14, 12],
      ]),
      catmull([
        [30, 28],
        [32, 20],
        [36, 14],
        [40, 10],
      ]),
      catmull([
        [25, 40],
        [32, 44],
        [40, 46],
      ]),
    ],
  },
  // before the walls of Quy Nhon; the road west climbs to the pass
  "quynhon-gate": {
    ...open,
    seed: 207,
    relief: [0.8, 0.8],
    biome: "coast",
    fog: { color: 0xc4d2da, near: 12, far: 48 },
    roads: [
      dirt(
        [
          [24, 51],
          [24, 36],
          [24.2, 24],
          [24, 13],
        ],
        1.0,
      ),
      dirt(
        [
          [24, 34],
          [14, 31],
          [4, 30],
          [-3, 30],
        ],
        0.8,
      ),
    ],
    shape: seaward(40, 6),
  },
  // the mountain pass: stone on both sides, frost in the hollows
  "mountain-pass": {
    ...open,
    seed: 208,
    relief: [1.0, 1.0],
    biome: "pass",
    fog: { color: 0xc8d0d8, near: 6, far: 34 },
    roads: [
      dirt(
        [
          [51, 30],
          [40, 30.4],
          [32, 26],
          [27, 18],
          [24.6, 8],
          [24, -3],
        ],
        0.8,
      ),
    ],
    shape: (x, z, h, roadD) => {
      // the valley follows the road; the slopes rise steeply away from it
      const d = Math.max(0, roadD - 2)
      return h + Math.min(5, d * d * 0.06) + (fbm(x, z, 0.3, 13) - 0.5) * Math.min(1, d * 0.2)
    },
  },
  // before the walls of Hue, chimneys smoking behind them
  "hue-gate": {
    ...open,
    seed: 209,
    relief: [0.8, 0.8],
    biome: "pass",
    fog: { color: 0xc8d0d8, near: 10, far: 42 },
    roads: [
      dirt(
        [
          [-3, 30],
          [10, 30.4],
          [20, 27],
          [24, 24],
          [24, 13],
        ],
        1.0,
      ),
    ],
  },
}

export const OPEN_SIDES: Record<string, string> = { "sea-cliff": "e", "net-sheds": "e", "quynhon-gate": "e" }
export const FIELD_LAYOUTS: Record<string, Layout> = Object.fromEntries(Object.entries(LAYOUTS).map(([id, l]) => [id, rimmed(l, OPEN_SIDES[id])]))
