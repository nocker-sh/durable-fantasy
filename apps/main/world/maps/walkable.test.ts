import { expect, it } from "vitest"
import { walkable } from "#/world/maps/walkable"
import type { Cell } from "#/world/maps/types"

const map = { size: 2, rows: [".#", ".."] }
const invalidCells: readonly Cell[] = [
  [0.5, 0],
  [0, 0.5],
  [-1, 0],
  [NaN, 0],
  [0, Infinity],
]
it.each(invalidCells.map((cell) => ({ cell })))("rejects an invalid cell without indexing an unknown row: %j", (input) => {
  expect(walkable(map, input.cell)).toBe(false)
})
it.each([0, 1.5, Infinity, NaN])("rejects invalid grid dimensions %s", (size) => {
  expect(walkable({ ...map, size }, [0, 0])).toBe(false)
})
it("treats a missing row as blocked", () => {
  expect(walkable({ size: 2, rows: [".."] }, [0, 1])).toBe(false)
})
it("does not accept a runtime coordinate with extra components", () => {
  const request = { cell: [0, 0] satisfies Cell }
  Object.assign(request, { cell: [0, 0, 0] })
  expect(walkable(map, request.cell)).toBe(false)
})
it("preserves ordinary walkable and blocked cells", () => {
  expect(walkable(map, [0, 0])).toBe(true)
  expect(walkable(map, [1, 0])).toBe(false)
  expect(walkable(map, [1, 1])).toBe(true)
})
