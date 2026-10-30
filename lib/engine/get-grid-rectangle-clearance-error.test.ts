import { expect, it } from "vitest"
import { getGridRectangleClearanceError } from "./get-grid-rectangle-clearance-error"
it("detects a blocked interior cell despite clear corners and permits a touching outside cell", () => {
  expect(getGridRectangleClearanceError({ rect: [0, 0, 3, 3], cellSize: 1, isCellFree: (cell) => cell[0] !== 1 || cell[1] !== 1 })).toBeInstanceOf(Error)
  expect(getGridRectangleClearanceError({ rect: [0, 0, 1, 1], cellSize: 1, isCellFree: (cell) => cell[0] === 0 && cell[1] === 0 })).toBeNull()
})
it("rejects invalid, collapsed and unbounded scans", () => {
  expect(getGridRectangleClearanceError({ rect: [0, 0, 0, 1], cellSize: 1, isCellFree: () => true })).toBeInstanceOf(Error)
  expect(getGridRectangleClearanceError({ rect: [0, 0, 1, Infinity], cellSize: 1, isCellFree: () => true })).toBeInstanceOf(Error)
  expect(getGridRectangleClearanceError({ rect: [0, 0, 1, 1], cellSize: 0, isCellFree: () => true })).toBeInstanceOf(Error)
  expect(getGridRectangleClearanceError({ rect: [0, 0, 1000, 1000], cellSize: 1, isCellFree: () => true })).toBeInstanceOf(Error)
})
