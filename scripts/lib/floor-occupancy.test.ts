import { expect, it } from "vitest"
import { FloorOccupancy } from "#/scripts/lib/floor-occupancy"

it("counts a shared wall and doorway once without overlapping usable space", () => {
  const floor = new FloorOccupancy({ width: 5, depth: 3 })
  expect(floor.addRoom({ id: "west", origin: [0, 0], rows: ["###", "#.D", "###"] })).toEqual([])
  expect(floor.addRoom({ id: "east", origin: [2, 0], rows: ["###", "D.#", "###"] })).toEqual([])
  expect(floor.size).toBe(15)
})

it.each([
  [".", "."],
  ["B", "B"],
  [".", "B"],
  ["#", "."],
  ["D", "#"],
  ["D", "."],
])("rejects overlapping %s and %s occupancy", (first, second) => {
  const floor = new FloorOccupancy({ width: 1, depth: 1 })
  floor.addRoom({ id: "first", origin: [0, 0], rows: [first] })
  expect(floor.addRoom({ id: "second", origin: [0, 0], rows: [second] })).toEqual(["second: conflicting room overlap at 0,0"])
})

it("reports room cells outside the building", () => {
  const floor = new FloorOccupancy({ width: 2, depth: 2 })
  expect(floor.addRoom({ id: "outside", origin: [-1, 0], rows: [".."] })).toEqual(["outside: outside building"])
})

it("keeps different floors independent and does not borrow mutable dimensions", () => {
  const dimensions = { width: 1, depth: 1 }
  const lower = new FloorOccupancy(dimensions)
  const upper = new FloorOccupancy(dimensions)
  dimensions.width = 0
  const room = { id: "room", origin: [0, 0] satisfies [number, number], rows: ["."] }
  const original = structuredClone(room)
  expect(lower.addRoom(room)).toEqual([])
  expect(upper.addRoom(room)).toEqual([])
  expect(room).toEqual(original)
  expect(Object.isFrozen(lower)).toBe(true)
})
