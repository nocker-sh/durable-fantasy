import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { getDirtRoad } from "#/world/maps/get-dirt-road"
import { OPEN_GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

// the meadow below the south gate: gentle hills, Otto's orchard, slimes in the grass
export const SOUTH_MEADOW_LAYOUT: Layout = {
  ...OPEN_GROUND_LAYOUT_BASE,
  seed: 201,
  relief: [1.4, 1.4],
  biome: "meadow",
  // south from the gate, then east to the edge of the forest; a branch on south to the dunes
  roads: [
    getDirtRoad(
      [
        [24, -3],
        [24.6, 8],
        [22.8, 16],
        [24, 24],
        [30, 26],
        [40, 26.2],
        [51, 26],
      ],
      0.95,
    ),
    getDirtRoad(
      [
        [24, 24],
        [23, 32],
        [23.6, 40],
        [24.5, 51],
      ],
      0.8,
    ),
  ],
  // worn by feet: into the orchard, up to the lone tree on the hill, and the slimes' ground
  trails: [
    getCatmullPath([
      [23.6, 12],
      [18, 11],
      [12, 10.5],
      [8, 9.4],
    ]),
    getCatmullPath([
      [25.4, 18],
      [29, 16.5],
      [32.4, 14.6],
      [34, 13.4],
    ]),
    getCatmullPath([
      [26, 26.3],
      [30, 30],
      [36, 34],
      [40, 38],
    ]),
  ],
}
