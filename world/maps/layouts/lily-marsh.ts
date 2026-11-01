import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getMarshGroundHeight } from "#/world/maps/get-marsh-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// the lily marsh below the highland: ponds among reeds, the road on a low causeway between them
export const LILY_MARSH_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 212,
  relief: [0.5, 0.5],
  biome: "marsh",
  fog: { color: 0xc4ccc4, near: 7, far: 34 },
  roads: [
    getDirtRoad(
      [
        [24, -3],
        [24, 7],
        [22.5, 13],
        [23.5, 22],
        [25, 28],
        [24.4, 40],
        [24, 51],
      ],
      0.8,
    ),
  ],
  // out to the jetty on the south-east pond and round the north-west one
  trails: [
    getCatmullPath([
      [25, 28],
      [27.5, 30.5],
      [29.5, 32],
    ]),
    getCatmullPath([
      [23, 16],
      [19.5, 14.5],
      [17, 12.5],
    ]),
  ],
  shape: getMarshGroundHeight,
}
