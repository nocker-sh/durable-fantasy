// The ground plan of a map, as data: its river, roads, yards and fields, and the landform of a
// field map. The scene paints and builds from it (scene/world.ts); the server and the tests read it
// too, so nothing here draws.

export type V2 = [number, number]

import { Polyline } from "../../lib/engine/polyline.ts"
export const catmull = Polyline.catmull

export { smooth } from "../../lib/engine/math.ts"

// ------------------------------------------------------------------ layout
// Each map describes its ground with a Layout (scene/world.ts swaps it in and recomputes the
// fields). A feature a map does not have sits far outside it (OFF).

export interface Road {
  pts: V2[]
  w: number
  kind: "cobble" | "dirt" | "pave"
}
export type Rect = { x0: number; z0: number; x1: number; z1: number }

export interface Layout {
  /** river centre line and half width; OFF_LINE for none */
  river: V2[]
  riverHW: number
  /** z range where the river runs between stone embankments */
  embanked: [number, number]
  roads: Road[]
  /** round paved square and its radius; OFF_POINT for none */
  plaza: V2
  plazaR: number
  terrace: Rect & { h: number }
  stairs: Rect
  lavoir: Rect & { h: number }
  lavStairs: Rect
  bridge: Rect
  fields: (Rect & { axis: "x" | "z" })[]
  pigpen: Rect
  pasture: Rect
  graveyard: Rect
  gardens: Rect[]
  dirtPatches: [number, number, number, number][]
  /** the flatter, built-up part: centre and radii (wilder, hillier ground outside) */
  town: [number, number, number, number]
  /** seed for the rolling height noise */
  seed: number
  /** how rolling the ground is inside and outside the town */
  relief: [number, number]
  /** a field's own landform, applied over the rolling ground: dunes, a sea cliff, a pass */
  shape?: (x: number, z: number, h: number, roadD: number) => number
  /** a field's ground: what grows or lies where no road or yard is (terrain.ts) */
  biome?: "meadow" | "dune" | "coast" | "forest" | "pass"
  /** fog colour and range (in tiles beyond the player), for haze over dunes or mist in the forest */
  fog?: { color: number; near: number; far: number }
  /** footpaths worn into the ground by people and animals: drawn only, they block and flatten nothing */
  trails?: V2[][]
}

export const OFF: Rect & { h: number } = { x0: -99, z0: -99, x1: -98, z1: -98, h: 0 }
export const OFF_POINT: V2 = [-99, -99]
export const OFF_LINE: V2[] = [
  [-99, -99],
  [-98, -99],
]

const rx30 = riverX0(
  30,
  catmull([
    [33, -3],
    [32.6, 5],
    [33.6, 11],
    [33, 17],
    [31.7, 23],
    [31.4, 29],
    [32.6, 35],
    [34, 41],
    [33.4, 51],
  ]),
)
export function riverX0(z: number, river: V2[]): number {
  let best = 1e9,
    bx = 0
  for (const [x, zz] of river)
    if (Math.abs(zz - z) < best) {
      best = Math.abs(zz - z)
      bx = x
    }
  return bx
}

/** The village around the market square (the first map). */
export const VILLAGE: Layout = {
  river: catmull([
    [33, -3],
    [32.6, 5],
    [33.6, 11],
    [33, 17],
    [31.7, 23],
    [31.4, 29],
    [32.6, 35],
    [34, 41],
    [33.4, 51],
  ]),
  riverHW: 1.6,
  embanked: [5, 41],
  roads: [
    {
      pts: catmull([
        [19, 41],
        [18.6, 36],
        [18.8, 31],
        [19, 28],
      ]),
      w: 1.05,
      kind: "cobble",
    },
    {
      pts: catmull([
        [19.2, 50],
        [19.4, 45],
        [19, 41],
      ]),
      w: 0.95,
      kind: "dirt",
    },
    {
      pts: catmull([
        [23.5, 23],
        [27, 22.2],
        [30, 22],
      ]),
      w: 0.95,
      kind: "cobble",
    },
    {
      pts: catmull([
        [34, 22],
        [37, 22.4],
        [40, 23.5],
        [44, 23.4],
        [50, 23],
      ]),
      w: 0.9,
      kind: "dirt",
    },
    {
      pts: catmull([
        [19, 19.5],
        [18.4, 16.6],
        [16.2, 14.8],
      ]),
      w: 0.95,
      kind: "cobble",
    },
    {
      pts: catmull([
        [14.5, 24.5],
        [11, 25.4],
        [7, 25.6],
        [3.5, 25.3],
      ]),
      w: 0.95,
      kind: "cobble",
    },
    {
      pts: catmull([
        [3.5, 25.3],
        [0, 25],
        [-3, 25],
      ]),
      w: 0.85,
      kind: "dirt",
    },
    {
      pts: catmull([
        [40, 23.5],
        [40.6, 20.5],
        [41.5, 18.6],
      ]),
      w: 0.7,
      kind: "dirt",
    },
    {
      pts: catmull([
        [37, 22.4],
        [37.2, 15],
        [37.8, 10],
      ]),
      w: 0.7,
      kind: "dirt",
    },
    {
      pts: catmull([
        [40.5, 23.6],
        [41.2, 28],
        [42, 30.5],
      ]),
      w: 0.65,
      kind: "dirt",
    },
    // the lane past the back of the inn down to the washing place
    {
      pts: catmull([
        [19.4, 36.4],
        [24, 36.5],
        [27.4, 36.4],
        [29.5, 35.4],
        [29.3, 33.4],
      ]),
      w: 0.7,
      kind: "cobble",
    },
    // the lane behind the north side of the square, to the lamplighter's and the brother's doors
    {
      pts: catmull([
        [17.4, 15.2],
        [19.2, 12.85],
        [24, 12.65],
        [30, 12.65],
      ]),
      w: 0.45,
      kind: "pave",
    },
    // the back lane west off the south road, between the rows of cottages
    {
      pts: catmull([
        [18.6, 34],
        [12, 34],
        [6, 34.1],
        [1.2, 34],
      ]),
      w: 0.5,
      kind: "pave",
    },
    {
      pts: catmull([
        [16, 11.6],
        [13.5, 9.6],
        [11.6, 7.6],
      ]),
      w: 0.6,
      kind: "pave",
    },
  ],
  plaza: [19, 24],
  plazaR: 4.6,
  terrace: { x0: 3, z0: 0.5, x1: 21, z1: 12, h: 1.9 },
  stairs: { x0: 15, x1: 17.2, z0: 12, z1: 14.6 },
  lavoir: { x0: rx30 - 1.6 - 1.25, x1: rx30 - 1.6 + 0.02, z0: 28.4, z1: 32.0, h: -0.74 },
  lavStairs: { x0: rx30 - 1.6 - 1.25, x1: rx30 - 1.6 + 0.02 - 0.1, z0: 32.0, z1: 33.3 },
  bridge: { x0: 29.0, x1: 34.6, z0: 21.15, z1: 22.85 },
  fields: [
    { x0: 40.4, z0: 1.5, x1: 44.2, z1: 9.5, axis: "x" },
    { x0: 38.2, z0: 10.4, x1: 40.8, z1: 14.6, axis: "z" },
  ],
  pigpen: { x0: 36.4, z0: 25.8, x1: 40.2, z1: 29.2 },
  pasture: { x0: 42.4, z0: 30.4, x1: 47, z1: 40.5 },
  graveyard: { x0: 4, z0: 7.6, x1: 8.6, z1: 11.3 },
  gardens: [
    { x0: 1.6, z0: 40.6, x1: 5.6, z1: 43.4 },
    { x0: 6, z0: 19.4, x1: 8.8, z1: 22.4 },
    { x0: 7.4, z0: 40.2, x1: 9.8, z1: 42.6 },
  ],
  dirtPatches: [
    [12.3, 28.4, 16.8, 33], // smithy yard
    [10, 18.3, 14.8, 22], // bakery yard
    [38.2, 18.2, 41, 20.8], // coop yard
    [22, 37.6, 28.5, 40.4], // drying yard
    [2.2, 19, 4.6, 23.6], // woodcutter
  ],
  town: [18, 26, 18, 17],
  seed: 7,
  relief: [0.7, 1.5],
}
