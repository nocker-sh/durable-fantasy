import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import { OFF_POINT } from "#/world/maps/empty-layout-features"
import type { Layout } from "#/world/maps/layout-types"

export const CRAFT: Layout = {
  ...GROUND_LAYOUT_BASE,
  roads: [
    {
      pts: getCatmullPath([
        [-3, 23],
        [8, 23.4],
        [20, 23],
        [30, 22.6],
        [40, 23],
      ]),
      w: 1.1,
      kind: "cobble",
    },
    {
      pts: getCatmullPath([
        [20, 23],
        [19.6, 32],
        [20, 40],
      ]),
      w: 0.85,
      kind: "dirt",
    },
  ],
  plaza: OFF_POINT,
  plazaR: 0,
  dirtPatches: [
    [14, 25, 19, 29],
    [24, 25, 29, 28.6],
    [8, 17.2, 12.6, 20.6],
  ],
  town: [20, 24, 18, 14],
  seed: 13,
}
