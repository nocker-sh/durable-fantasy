import { expect, it } from "vitest"
import { getSweptGridClearanceError } from "#/lib/engine/get-swept-grid-clearance-error"
const isCellFree = (cell: readonly [number, number]) => cell[0] !== 3 || cell[1] !== 2
it("finds an obstacle beside the centre line, between two clear endpoint footprints", () => {
  expect(getSweptGridClearanceError({ from: [0.75, 0.75], to: [0.75, 0.75], radius: 0.27, cellSize: 0.5, isCellFree })).toBeNull()
  expect(getSweptGridClearanceError({ from: [2.75, 0.75], to: [2.75, 0.75], radius: 0.27, cellSize: 0.5, isCellFree })).toBeNull()
  expect(getSweptGridClearanceError({ from: [0.75, 0.75], to: [2.75, 0.75], radius: 0.27, cellSize: 0.5, isCellFree })).toEqual(new Error("Moving footprint intersects a blocked grid cell"))
})
it("allows exact tangency and rejects invalid or unbounded footprints", () => {
  expect(getSweptGridClearanceError({ from: [0.75, 0.75], to: [2.75, 0.75], radius: 0.25, cellSize: 0.5, isCellFree })).toBeNull()
  expect(getSweptGridClearanceError({ from: [0, 0], to: [1, 1], radius: NaN, cellSize: 0.5, isCellFree })).toEqual(new Error("Invalid moving footprint"))
  expect(getSweptGridClearanceError({ from: [0, 0], to: [1e9, 1e9], radius: 1, cellSize: 0.5, isCellFree })).toEqual(new Error("Moving footprint exceeds traversal budget"))
})
