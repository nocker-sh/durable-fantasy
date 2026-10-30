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
    // the back alley behind the north row: washing, barrels, the kitchen doors
    {
      pts: getCatmullPath([
        [2.5, 16.2],
        [12, 16.1],
        [24, 16.2],
        [36, 16.3],
        [45, 16.2],
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
