import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getPassGroundHeight } from "#/world/maps/get-pass-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// the mountain pass: stone on both sides, frost in the hollows
export const MOUNTAIN_PASS_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 208,
  relief: [1.0, 1.0],
  biome: "pass",
  fog: { color: 0xc8d0d8, near: 6, far: 34 },
  roads: [
    getDirtRoad(
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
  shape: getPassGroundHeight,
}
