import { expect, it } from "vitest"
import { getWalkGridMismatches } from "#/scripts/lib/get-walk-grid-mismatches"

it("reads the rendered grid row after row and names the cells that differ as [x, z]", () => {
  expect(getWalkGridMismatches({ map: "map", blocked: "0110", size: 2, rows: [".#", "#."] })).toEqual([])
  expect(getWalkGridMismatches({ map: "map", blocked: "0100", size: 2, rows: [".#", "#."] })).toEqual([[0, 1]])
  expect(getWalkGridMismatches({ map: "map", blocked: "1110", size: 2, rows: [".#", "##"] })).toEqual([
    [0, 0],
    [1, 1],
  ])
})

it("refuses grids of another size instead of comparing part of them", () => {
  expect(() => getWalkGridMismatches({ map: "map", blocked: "011", size: 2, rows: [".#", "#."] })).toThrow("Grid dimensions differ: map")
  expect(() => getWalkGridMismatches({ map: "map", blocked: "0110", size: 2, rows: [".#"] })).toThrow("Grid dimensions differ: map")
})
