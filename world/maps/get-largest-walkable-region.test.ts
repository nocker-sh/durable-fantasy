import { expect, it } from "vitest"
import { getLargestWalkableRegion } from "#/world/maps/get-largest-walkable-region"

const fixture = (rows: readonly string[]) => ({ id: "same-id", size: rows.length, rows })
it("keeps the first component when equally sized islands tie", () => {
  const map = fixture(["..#..", "#####", "#####", "#####", "#####"]),
    before = structuredClone(map)
  expect([...getLargestWalkableRegion(map)]).toEqual([0, 1])
  expect(map).toEqual(before)
})
it("does not reuse another grid's component under the same map id", () => {
  expect([...getLargestWalkableRegion(fixture(["..#", "###", "###"]))]).toEqual([0, 1])
  expect([...getLargestWalkableRegion(fixture(["###", "###", "#.."]))]).toEqual([7, 8])
})
it("does not join diagonal cells or wrap from one row to the next", () => {
  expect([...getLargestWalkableRegion(fixture(["##.", ".##", "#.#"]))]).toEqual([2])
})
it("returns no mainland for an entirely blocked grid", () => {
  expect(getLargestWalkableRegion(fixture(["##", "##"])).size).toBe(0)
})
it.each([0, 1.5, Infinity, NaN])("rejects invalid dimensions %s before allocating traversal state", (size) => {
  expect(() => getLargestWalkableRegion({ ...fixture(["."]), size })).toThrow("Invalid map walk grid")
})
it.each([[".."], ["..", "."], [".?", ".."]].map((rows) => ({ rows })))("rejects incomplete or unknown grid cells: %j", (input) => {
  expect(() => getLargestWalkableRegion({ ...fixture(input.rows), size: 2 })).toThrow("Invalid map walk grid")
})

it("rejects sparse or nonstring rows before traversal", () => {
  const rows: string[] = []
  rows.length = 2
  rows[0] = ".."
  expect(() => getLargestWalkableRegion(fixture(rows))).toThrow("Invalid map walk grid")
  const map = fixture(["..", ".."])
  Object.assign(map, { rows: [1, 2] })
  expect(() => getLargestWalkableRegion(map)).toThrow("Invalid map walk grid")
})
