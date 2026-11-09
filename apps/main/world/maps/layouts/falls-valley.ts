import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getValleyGroundHeight } from "#/world/maps/get-valley-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// the valley of the falls: two rock steps, a stream falling over both into the pool at the foot
export const FALLS_VALLEY_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 213,
  relief: [0.8, 0.8],
  biome: "valley",
  fog: { color: 0xd0d8d4, near: 6, far: 32 },
  // down from the marsh through cuts in both steps, out east to the salt flats
  roads: [
    getDirtRoad(
      [
        [24, -3],
        [24.5, 7],
        [29, 14],
        [32, 22],
        [35, 27],
        [42, 29.6],
        [51, 30],
      ],
      0.8,
    ),
  ],
  // to the foot of the lower fall, and up beside the upper one
  trails: [
    getCatmullPath([
      [35, 27],
      [33.5, 31.5],
      [32.6, 34.6],
    ]),
    getCatmullPath([
      [29, 14],
      [24, 17],
      [20.5, 20],
    ]),
  ],
  shape: getValleyGroundHeight,
}
