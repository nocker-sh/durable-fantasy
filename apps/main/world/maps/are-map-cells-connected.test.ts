import { expect, it } from "vitest"
import { areMapCellsConnected } from "#/world/maps/are-map-cells-connected"

const map = { size: 5, rows: ["#####", "#...#", "#.#.#", "#...#", "#####"] }
it("reaches every requested exit around obstacles without changing inputs", () => {
  const original = structuredClone(map)
  expect(
    areMapCellsConnected(
      map,
      [1, 1],
      [
        [3, 1],
        [3, 3],
        [1, 3],
      ],
    ),
  ).toBe(true)
  expect(map).toEqual(original)
})
it("rejects an isolated exit despite free endpoints", () => {
  expect(areMapCellsConnected({ ...map, rows: ["#####", "#.#.#", "#####", "#...#", "#####"] }, [1, 1], [[3, 1]])).toBe(false)
})
it("does not move a blocked endpoint to a nearby free cell", () => {
  expect(areMapCellsConnected(map, [1, 1], [[2, 2]])).toBe(false)
  expect(areMapCellsConnected(map, [2, 2], [[1, 1]])).toBe(false)
})
it("allows repeated targets and an empty target inventory for a valid start", () => {
  expect(
    areMapCellsConnected(
      map,
      [1, 1],
      [
        [3, 3],
        [3, 3],
      ],
    ),
  ).toBe(true)
  expect(areMapCellsConnected(map, [1, 1], [])).toBe(true)
})
