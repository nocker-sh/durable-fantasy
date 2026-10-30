import { getCatmullPath } from "#/lib/engine/get-catmull-path"
import { GROUND_LAYOUT_BASE } from "#/world/maps/ground-layout-bases"
import type { Layout } from "#/world/maps/layout-types"

export const GATE: Layout = {
  ...GROUND_LAYOUT_BASE,
  roads: [
    {
      pts: getCatmullPath([
        [19.2, -3],
        [20.2, 6],
        [23.2, 14],
        [24.2, 24],
        [24, 38],
        [24, 51],
      ]),
      w: 1.15,
      kind: "cobble",
    },
    // the lane west between the hunter's and the teacher's houses
    {
      pts: getCatmullPath([
        [23.6, 22.2],
        [16, 21.8],
        [9, 22.1],
        [2.5, 22],
      ]),
      w: 0.55,
      kind: "dirt",
    },
  ],
  plaza: [24, 18],
  plazaR: 3.2,
  gardens: [{ x0: 13, z0: 10, x1: 17, z1: 13 }], // the guards' vegetable patch behind the guardhouse
  town: [24, 20, 16, 16],
  seed: 17,
}
