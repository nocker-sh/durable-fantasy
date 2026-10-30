import { expect, it } from "vitest"
import { getConnectedGridCells } from "#/lib/engine/get-connected-grid-cells"

it("finds only the connected floor without crossing a wall or the grid boundary", () => {
  const floor = ["..#..", ".##..", "..#.."]
  const cells = getConnectedGridCells({ width: 5, height: 3, start: [0, 0], isFree: (x, y) => floor[y][x] === "." })
  expect([...cells].sort()).toEqual(["0,0", "0,1", "0,2", "1,0", "1,2"])
})

it("does not cut corners or move a blocked or invalid start to another cell", () => {
  const props = { width: 2, height: 2, start: [0, 0] satisfies readonly [number, number], isFree: (x: number, y: number) => x === y }
  expect([...getConnectedGridCells(props)]).toEqual(["0,0"])
  expect(getConnectedGridCells({ ...props, start: [0, 1] }).size).toBe(0)
  expect(getConnectedGridCells({ ...props, start: [-1, 0] }).size).toBe(0)
  expect(getConnectedGridCells({ ...props, start: [0.5, 0] }).size).toBe(0)
  expect(getConnectedGridCells({ ...props, width: Infinity }).size).toBe(0)
})
