import { hill } from "#/world/maps/landforms/hill"
import { hollow } from "#/world/maps/landforms/hollow"
import { terraced } from "#/world/maps/landforms/terraced"
import { MEADOW_TERRACES } from "#/world/maps/meadow-terraces"
import { smooth } from "#/lib/engine/smooth"
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
  // the lone tree's hill (gentle from the road, a rocky scarp to the north-east), the pond fed by the
  // wet ground east of it, the old terraced fields climbing to the stopped windmill in the south-west,
  // and the hollow where a war engine lies in the grass (landscape.md「マップごとのテーマ」)
  shape: (inputProps) => {
    const x = inputProps.x
    const z = inputProps.z
    const height = { value: inputProps.h }
    const dx = x - 34,
      dz = z - 12.5
    const ne = smooth(-0.2, 0.6, (dx - dz) / (Math.hypot(dx, dz) || 1) / Math.SQRT2)
    const d = Math.hypot(dx, dz)
    height.value += 1.8 * (smooth(7.5, 2.2, d) * (1 - ne) + smooth(4.3, 3.7, d) * ne)
    const T = MEADOW_TERRACES
    height.value += terraced({ x: x, z: z, edges: T.edges, step: T.step, rampX: T.rampX, rampW: T.rampW, seed: 3 }) * smooth(T.x1 + 2, T.x1 - 3, x) * smooth(T.x0 - 3, T.x0, x)
    height.value -= hill({ x: x, z: z, cx: 39.5, cz: 37, r: 4.5, flat: 1.2, top: 0.7 })
    return hollow({ x: x, z: z, h: height.value, cx: 40.5, cz: 19.5, r: 4.2, floor: -1.35, seed: 31 })
  },
  // south from the gate, then east to the edge of the forest; a branch on south to the dunes, and one
  // west between the vineyard and the old terraces, up to the silver-grass highland
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
    getDirtRoad(
      [
        [24, 24],
        [18, 25],
        [10, 24.4],
        [-3, 24.5],
      ],
      0.75,
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
