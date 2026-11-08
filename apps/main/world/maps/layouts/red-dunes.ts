import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getDuneGroundHeight } from "#/world/maps/get-dune-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// red and white dunes: long ridges across the wind, frost on the lee sides
export const RED_DUNES_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 202,
  relief: [0.6, 0.6],
  biome: "dune",
  fog: { color: 0xe0c8b0, near: 10, far: 42 },
  roads: [
    getDirtRoad(
      [
        [24.5, -3],
        [25, 8],
        [28, 17],
        [36, 22.5],
        [51, 22],
      ],
      0.8,
    ),
  ],
  shape: getDuneGroundHeight,
}
