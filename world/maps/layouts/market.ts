import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

export const MARKET: Layout = {
  ...GROUND_LAYOUT_BASE,
  roads: [
    {
      pts: getCatmullPath([
        [-3, 24],
        [10, 24],
        [24, 24.2],
        [38, 24.2],
        [51, 25],
      ]),
      w: 1.25,
      kind: "cobble",
    },
    {
      pts: getCatmullPath([
        [24, 24],
        [24, 15],
        [24.5, 8],
      ]),
      w: 0.8,
      kind: "pave",
    },
    // south between the night stalls, down to the west fields
    {
      pts: getCatmullPath([
        [17.9, 25],
        [17.9, 34],
        [18.3, 44],
        [18.5, 51],
      ]),
      w: 0.7,
      kind: "dirt",
    },
    // the back alley behind the north row: washing, barrels, the kitchen doors
    {
      pts: getCatmullPath([
        [1.5, 16],
        [12, 15.9],
        [24, 16],
        [36, 16.05],
        [45.5, 16],
      ]),
      w: 0.5,
      kind: "pave",
    },
  ],
  plaza: [24, 24],
  plazaR: 3.6,
  town: [24, 24, 20, 14],
  seed: 11,
}
