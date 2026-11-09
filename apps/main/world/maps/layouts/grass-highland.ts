import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { getHighlandGroundHeight } from "#/world/maps/get-highland-ground-height"
import type { Layout } from "#/world/maps/layout-types"

// the silver-grass highland west of the meadow: swells of dry grass, the dead giant on its knoll
export const GRASS_HIGHLAND_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 211,
  relief: [1.2, 1.2],
  biome: "highland",
  fog: { color: 0xd8ccb0, near: 10, far: 42 },
  // in from the meadow on the east, over the dip, then south down to the marsh
  roads: [
    getDirtRoad(
      [
        [51, 24.5],
        [42, 24],
        [33, 22],
        [26, 24],
        [22.6, 30],
        [23, 40],
        [24, 51],
      ],
      0.8,
    ),
  ],
  // worn by the grass cutters: up to the drying racks and the dead giant on the knoll
  trails: [
    getCatmullPath([
      [27, 23.6],
      [22, 20],
      [17, 16.5],
      [14.5, 14.5],
    ]),
    getCatmullPath([
      [23, 34],
      [29, 36],
      [34, 37.5],
    ]),
  ],
  shape: getHighlandGroundHeight,
}
