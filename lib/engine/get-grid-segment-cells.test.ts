import { expect, it } from "vitest"
import { getGridSegmentCells } from "#/lib/engine/get-grid-segment-cells"
it("covers corner neighbours rather than sampling only the diagonal cells", () => {
  const cells = getGridSegmentCells({ from: [0.25, 0.25], to: [1.25, 1.25], cellSize: 0.5 })
  expect(cells).toEqual(
    expect.arrayContaining([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2],
    ]),
  )
})
it("terminates at mixed-sign boundary endpoints without stepping past an axis already at its goal", () => {
  const cells = getGridSegmentCells({ from: [0.2, 1.2], to: [1, 0], cellSize: 1 })
  expect(cells[0]).toEqual([0, 1])
  expect(cells[cells.length - 1]).toEqual([1, 0])
  expect(cells).not.toContainEqual([1, -1])
  expect(getGridSegmentCells({ from: [1, 0], to: [0.2, 1.2], cellSize: 1 })).toEqual(
    expect.arrayContaining([
      [0, 0],
      [1, 0],
      [0, 1],
    ]),
  )
})
it("handles stationary and negative grid positions and rejects unbounded traversals", () => {
  expect(getGridSegmentCells({ from: [-0.25, -0.25], to: [-0.25, -0.25], cellSize: 0.5 })).toEqual([[-1, -1]])
  expect(() => getGridSegmentCells({ from: [NaN, 0], to: [1, 1], cellSize: 0.5 })).toThrow("Invalid grid segment")
  expect(() => getGridSegmentCells({ from: [0, 0], to: [1e9, 0], cellSize: 0.5 })).toThrow("traversal budget")
})
