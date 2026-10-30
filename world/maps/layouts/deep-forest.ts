import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

// deep in the forest: moss, fallen trunks, mist, an old wall from the war
export const DEEP_FOREST_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 206,
  relief: [1.6, 1.6],
  biome: "forest",
  fog: { color: 0x3e4c48, near: 2, far: 20 },
  roads: [
    getDirtRoad(
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
    getCatmullPath([
      [22, 33],
      [16, 28],
      [12, 20],
      [14, 12],
    ]),
    getCatmullPath([
      [30, 28],
      [32, 20],
      [36, 14],
      [40, 10],
    ]),
    getCatmullPath([
      [25, 40],
      [32, 44],
      [40, 46],
    ]),
  ],
}
