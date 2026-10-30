import { expect, it } from "vitest"
import { getAuthoredWallRuns } from "#/world/town/floorplan/get-authored-wall-runs"

it("orders columns, keeps gaps and excludes exterior cells", () => {
  const cells = [5, 0, 2, 6, 4, 1]
  const walls = new Set(cells)
  expect(getAuthoredWallRuns({ width: 7, walls })).toEqual([
    { start: 1, end: 3 },
    { start: 4, end: 6 },
  ])
  expect([...walls]).toEqual(cells)
})

it("handles empty rows and grids with no interior columns", () => {
  const walls = new Set([1])
  expect(getAuthoredWallRuns({ width: 7, walls: new Set() })).toEqual([])
  expect(getAuthoredWallRuns({ width: 1, walls })).toEqual([])
  expect(getAuthoredWallRuns({ width: 2, walls })).toEqual([])
  expect(getAuthoredWallRuns({ width: 3, walls })).toEqual([{ start: 1, end: 2 }])
})
