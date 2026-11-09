import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { createSeawardShape } from "#/world/maps/create-seaward-shape"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

// the beach where the net sheds stand, boats pulled up on the sand
export const NET_SHEDS_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 204,
  relief: [0.6, 0.6],
  biome: "coast",
  fog: { color: 0xc4d2da, near: 12, far: 48 },
  roads: [
    getDirtRoad(
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
    getDirtRoad(
      [
        [20, 23],
        [10, 22],
        [-3, 22],
      ],
      0.8,
    ),
    getDirtRoad(
      [
        [23, 30],
        [30, 31],
        [34, 31.4],
      ],
      0.6,
    ),
  ],
  shape: createSeawardShape(31, 9),
}
