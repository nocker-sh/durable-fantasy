import { expect, it } from "vitest"
import { locationAt, townLocation } from "./location.ts"
import { CELLS_PER_SECOND } from "../protocol.ts"

it("starts legacy saves in town and advances only completed path segments", () => {
  const start = townLocation(2, 1000)
  expect(start).toMatchObject({ world: 2, map: "phanthiet", connection: null })
  const moving = {
    ...start,
    route: [
      [1, 1],
      [2, 1],
      [3, 2],
    ] as [number, number][],
  }
  expect(locationAt(moving, 0)).toEqual([1, 1])
  expect(locationAt(moving, 1000 + (0.5 / CELLS_PER_SECOND) * 1000)).toEqual([1, 1])
  expect(locationAt(moving, 1000 + (1.1 / CELLS_PER_SECOND) * 1000)).toEqual([2, 1])
  expect(locationAt(moving, 1000 + (2 / CELLS_PER_SECOND) * 1000)).toEqual([2, 1])
  expect(locationAt(moving, 10000)).toEqual([3, 2])
})
