import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getCliffGroundHeight } from "#/world/maps/get-cliff-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// the road along the sea cliffs, the sea to the east
export const SEA_CLIFF_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 203,
  relief: [1.0, 1.0],
  biome: "coast",
  fog: { color: 0xc4d2da, near: 12, far: 48 },
  roads: [
    getDirtRoad(
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
  shape: getCliffGroundHeight,
}
