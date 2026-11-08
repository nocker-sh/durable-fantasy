import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getSaltGroundHeight } from "#/world/maps/get-salt-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// the salt flats east of the valley: white crust and brine sheets, the stopped salt works at the road's end
export const SALT_FLATS_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 214,
  relief: [0.4, 0.4],
  biome: "salt",
  fog: { color: 0xe4dcd8, near: 10, far: 44 },
  roads: [
    getDirtRoad(
      [
        [-3, 30],
        [8, 29.5],
        [16, 27],
        [23, 25],
        [29, 21],
        [33, 17],
      ],
      0.8,
    ),
  ],
  shape: getSaltGroundHeight,
}
