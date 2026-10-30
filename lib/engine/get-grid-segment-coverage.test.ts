import { expect, it } from "vitest"
import { getGridSegmentCoverage } from "./get-grid-segment-coverage"

it("returns full corner coverage without treating rejected input as an empty clear segment", () => {
  expect(getGridSegmentCoverage({ from: [0.25, 0.25], to: [0.75, 0.75], cellSize: 0.5 })).toEqual([
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ])
  expect(getGridSegmentCoverage({ from: [NaN, 0], to: [1, 1], cellSize: 0.5 })).toEqual(new Error("Invalid grid segment"))
  expect(getGridSegmentCoverage({ from: [0, 0], to: [100000, 0], cellSize: 0.5 })).toEqual(new Error("Grid segment exceeds traversal budget"))
})
