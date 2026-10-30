// The ground plans (world.ts Layout) of the districts beyond the square, the fields and the
// rooms: data and landforms only, with nothing drawn, so the workers that paint the ground can
// load them without the scene.
import { OFF, OFF_LINE, OFF_POINT, catmull, type Layout } from "#/world/maps/layout"
import { smooth } from "#/lib/engine/smooth"
import { fbm } from "#/lib/engine/fbm"

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
    // the back alley behind the north row: washing, barrels, the kitchen doors
    {
      pts: catmull([
        [2.5, 16.2],
        [12, 16.1],
        [24, 16.2],
        [36, 16.3],
        [45, 16.2],
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
    [8, 17.2, 12.6, 20.6],
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
    // the lane west between the hunter's and the teacher's houses
    {
      pts: catmull([
        [23.6, 22.2],
        [16, 21.8],
        [9, 22.1],
        [2.5, 22],
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
  (inputProps: Parameters<NonNullable<Layout["shape"]>>[0]) => {
    const x = inputProps.x
    const z = inputProps.z
    const h = inputProps.h
    return h - smooth(x0, x0 + width, x + (fbm({ x: x, y: z, scale: 0.15, seed: 7 }) - 0.5) * 3) * depth
  }

/** Hills rising along the map's edges (not on the open sides), so the land seems to go on. */
function rimmed(l: Layout, open = ""): Layout {
  const inner = l.shape
  return {
    ...l,
    shape: (inputProps: { x: number; z: number; h: number; roadD: number }) => {
      const x = inputProps.x
      const z = inputProps.z
      const h = inputProps.h
      const roadD = inputProps.roadD

      const sides: [string, number][] = [
        ["w", x],
        ["n", z],
        ["e", N - x],
        ["s", N - z],
      ]
      let rim = 0
      for (const entry of sides) {
        const k = entry[0]
        const d = entry[1]
        if (!open.includes(k)) rim = Math.max(rim, smooth(5, 0.5, d + (fbm({ x: x, y: z, scale: 0.2, seed: 17 }) - 0.5) * 2))
      }
      return (inner ? inner({ x: x, z: z, h: h, roadD: roadD }) : h) + rim * 2.2
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
    shape: (inputProps: Parameters<NonNullable<Layout["shape"]>>[0]) => {
      const x = inputProps.x
      const z = inputProps.z
      const h = inputProps.h
      return h + (Math.sin(x * 0.33 + z * 0.12 + fbm({ x: x, y: z, scale: 0.08, seed: 9 }) * 4) * 0.5 + 0.5) ** 2 * 1.5
    },
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
    shape: (inputProps: Parameters<NonNullable<Layout["shape"]>>[0]) => {
      const x = inputProps.x
      const z = inputProps.z
      const h = inputProps.h

      const edge = 34 + Math.sin(z * 0.21) * 2 + (fbm({ x: x, y: z, scale: 0.2, seed: 11 }) - 0.5) * 2
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
    shape: (inputProps: { x: number; z: number; h: number; roadD: number }) => {
      const x = inputProps.x
      const z = inputProps.z
      const h = inputProps.h
      const roadD = inputProps.roadD

      // the valley follows the road; the slopes rise steeply away from it
      const d = Math.max(0, roadD - 2)
      return h + Math.min(5, d * d * 0.06) + (fbm({ x: x, y: z, scale: 0.3, seed: 13 }) - 0.5) * Math.min(1, d * 0.2)
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
export const FIELD_LAYOUTS: Record<string, Layout> = Object.fromEntries(
  Object.entries(LAYOUTS).map((entry2) => {
    const id = entry2[0]
    const l = entry2[1]
    return [id, rimmed(l, OPEN_SIDES[id])]
  }),
)
