import { expect, it } from "vitest"
import { getGridWaypoints } from "#/lib/engine/get-grid-waypoints"

it("reconstructs forward waypoints in world units without changing predecessors", () => {
  const previous = new Int32Array([-1, 0, -1, 1])
  const before = previous.slice()
  expect(getGridWaypoints({ previous, start: 0, goal: 3, size: 2, resolution: 2 })).toEqual([
    [0.25, 0.25],
    [0.75, 0.25],
    [0.75, 0.75],
  ])
  expect(previous).toEqual(before)
  expect(getGridWaypoints({ previous, start: 0, goal: 0, size: 2, resolution: 2 })).toEqual([[0.25, 0.25]])
})

it.each([
  [-1, -1, -1, -1],
  [-1, -1, -1, 2],
  [-1, 3, -1, 1],
  [-1, -1, -1, 4],
])("rejects broken and cyclic chains rather than returning a partial route: %j", (...entries) => {
  expect(getGridWaypoints({ previous: new Int32Array(entries), start: 0, goal: 3, size: 2, resolution: 1 })).toBeNull()
})

it("rejects invalid dimensions before reconstructing", () => {
  const source = { previous: new Int32Array(4), start: 0, goal: 3, size: 2, resolution: 1 }
  for (const resolution of [0, -1, NaN, Infinity]) expect(() => getGridWaypoints({ ...source, resolution })).toThrow(RangeError)
  expect(() => getGridWaypoints({ ...source, goal: 4 })).toThrow(RangeError)
  expect(() => getGridWaypoints({ ...source, size: 3 })).toThrow(RangeError)
})
