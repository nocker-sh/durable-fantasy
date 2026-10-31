import { expect, it } from "vitest"
import { getGridBoundaryOpening } from "#/scripts/lib/get-grid-boundary-opening"

it("keeps the midpoint of a continuous opening in cell units", () => {
  expect(getGridBoundaryOpening({ rows: ["#DDD#", "#...#", "#####"], door: [1, 0], span: 3 })).toEqual({ cell: [1, 0], offset: [1.5, 0], outward: [0, -1] })
})

it("rejects an interior opening and a vertical run broken by a solid cell", () => {
  expect(getGridBoundaryOpening({ rows: ["#####", "#DD.#", "#####"], door: [1, 1], span: 2 })).toBeUndefined()
  expect(getGridBoundaryOpening({ rows: ["#####", "D...#", "#...#", "D...#", "#####"], door: [0, 1], span: 3 })).toBeUndefined()
})
