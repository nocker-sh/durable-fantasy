import { expect, it } from "vitest"
import generated from "#/world/town/floorplan/authored/h-m5"
import { getAuthoredWallDividers } from "#/world/town/floorplan/get-authored-wall-dividers"
import type { AuthoredProjectedFloors } from "#/world/town/floorplan/authored-projection-types"

it("isolates floors and rows and omits exterior rows", () => {
  const row = (columns: readonly number[]) => ({ cells: new Map(), walls: new Set(columns) })
  const floors: AuthoredProjectedFloors = new Map([
    [
      0,
      new Map([
        [0, row([2])],
        [1, row([1])],
        [2, row([3])],
        [4, row([2])],
      ]),
    ],
    [1, new Map([[1, row([2])]])],
    [2, new Map([[1, row([4])]])],
  ])
  const source = { ...generated, width: 7, depth: 5, floors: 2, cellM: 0.5 }
  expect(getAuthoredWallDividers({ source, floors })).toEqual([
    { floor: 0, kind: "壁", x0: 0.5, z0: 0.5, x1: 1, z1: 1 },
    { floor: 0, kind: "壁", x0: 1.5, z0: 1, x1: 2, z1: 1.5 },
    { floor: 1, kind: "壁", x0: 1, z0: 0.5, x1: 1.5, z1: 1 },
  ])
})
