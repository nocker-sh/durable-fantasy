import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

// before the walls of Hue, chimneys smoking behind them
export const HUE_GATE_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 209,
  relief: [0.8, 0.8],
  biome: "pass",
  fog: { color: 0xc8d0d8, near: 10, far: 42 },
  roads: [
    getDirtRoad(
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
}
