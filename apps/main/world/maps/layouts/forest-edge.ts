import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

// the edge of the great forest, where Josef cuts wood and burns charcoal
export const FOREST_EDGE_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 205,
  relief: [1.2, 1.2],
  biome: "forest",
  fog: { color: 0x4e5e58, near: 5, far: 30 },
  // in from the meadow on the west, out north into the deep forest, and south to the beach
  roads: [
    getDirtRoad(
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
    getDirtRoad(
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
    getCatmullPath([
      [20, 22.6],
      [18.4, 25],
      [17, 26.5],
    ]),
    getCatmullPath([
      [28, 28],
      [34, 32],
      [40, 31],
      [46, 36],
    ]),
    getCatmullPath([
      [25, 12],
      [32, 10],
      [38, 6],
      [44, 4],
    ]),
  ],
}
