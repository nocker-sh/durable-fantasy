import type { Layout } from "#/world/maps/layout-types"
import { GROUND_LAYOUT_BASE as base } from "#/world/maps/ground-layout-bases"
import { getCatmullPath as catmull } from "#/lib/engine/get-catmull-path"
import { OFF_POINT } from "#/world/maps/empty-layout-features"
export const FIELDS: Layout = {
  ...base,
  roads: [
    {
      pts: catmull([
        [18.5, -3],
        [18.6, 8],
        [19.2, 16],
        [20.2, 21],
        [21, 22.2],
      ]),
      w: 0.8,
      kind: "dirt",
    },
    {
      pts: catmull([
        [21, 22.2],
        [30, 22.4],
        [40, 22.1],
        [51, 22],
      ]),
      w: 0.85,
      kind: "dirt",
    },
    // the farm lane west to the tenants' doors
    {
      pts: catmull([
        [21, 22.2],
        [14, 23.2],
        [7, 23],
        [2.5, 22.6],
      ]),
      w: 0.55,
      kind: "dirt",
    },
    // down to the pasture
    {
      pts: catmull([
        [21, 22.2],
        [21.6, 30],
        [22.4, 37],
      ]),
      w: 0.55,
      kind: "dirt",
    },
  ],
  plaza: OFF_POINT,
  plazaR: 0,
  fields: [
    {
      x0: 2.5,
      z0: 3,
      x1: 15,
      z1: 14,
      axis: "x",
    },
    {
      x0: 24,
      z0: 4,
      x1: 36,
      z1: 14.5,
      axis: "z",
    },
    {
      x0: 3,
      z0: 29,
      x1: 16.5,
      z1: 43,
      axis: "x",
    },
    {
      x0: 26,
      z0: 28.5,
      x1: 37,
      z1: 35,
      axis: "z",
    },
  ],
  pigpen: {
    x0: 40.5,
    z0: 26,
    x1: 45,
    z1: 30,
  },
  pasture: {
    x0: 29,
    z0: 38,
    x1: 44,
    z1: 45.5,
  },
  dirtPatches: [
    [16.6, 24.4, 19.6, 27],
    // round the well
    [38, 24.4, 40.2, 30], // the butcher's yard by the sties
  ],
  town: [22, 22, 20, 18],
  seed: 19,
  relief: [0.5, 1.2],
}
