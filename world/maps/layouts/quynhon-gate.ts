import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { createSeawardShape } from "#/world/maps/create-seaward-shape"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

// before the walls of Quy Nhon; the road west climbs to the pass
export const QUYNHON_GATE_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 207,
  relief: [0.8, 0.8],
  biome: "coast",
  fog: { color: 0xc4d2da, near: 12, far: 48 },
  roads: [
    getDirtRoad(
      [
        [24, 51],
        [24, 36],
        [24.2, 24],
        [24, 13],
      ],
      1.0,
    ),
    getDirtRoad(
      [
        [24, 34],
        [14, 31],
        [4, 30],
        [-3, 30],
      ],
      0.8,
    ),
  ],
  shape: createSeawardShape(40, 6),
}
