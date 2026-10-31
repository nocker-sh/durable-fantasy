import { expect, it } from "vitest"
import { getWorldMapSquares } from "#/world/maps/get-world-map-squares"
import { WORLD } from "#/world/maps/grid"
import type { Square } from "#/world/maps/grid-types"

it("indexes map reservations without instantiating locked cities or changing the grid", () => {
  const before = structuredClone(WORLD),
    squares = getWorldMapSquares(WORLD)
  expect([...squares.keys()]).toEqual(WORLD.flatMap((square) => (square.map ? [square.map] : [])))
  expect(WORLD).toEqual(before)
})
it.each(
  [
    [-1, 0],
    [0, -1],
    [0.5, 0],
    [Infinity, 0],
    [5, 0],
    [0, 5],
  ].map((at) => ({ at })),
)("rejects an invalid or unplaced square %j", (input) => {
  expect(() => getWorldMapSquares([{ at: [input.at[0], input.at[1]], map: "a" }])).toThrow("Invalid world-space square")
})
it("rejects empty or ambiguous reservations", () => {
  expect(() => getWorldMapSquares([{ at: [0, 0] }])).toThrow("reserve one map or city")
  expect(() => getWorldMapSquares([{ at: [0, 0], map: "a", city: "未建設" }])).toThrow("reserve one map or city")
})
it("rejects sparse coordinate pairs rather than accepting a missing component", () => {
  const at: [number, number] = [0, 0]
  Reflect.deleteProperty(at, 0)
  expect(() => getWorldMapSquares([{ at, map: "a" }])).toThrow("Invalid world-space square")
})
it.each([
  { at: [0, 0], map: "b" },
  { at: [0, 0], city: "未建設" },
] satisfies readonly Square[])("rejects overlapping map or city reservations %j", (square) => {
  expect(() => getWorldMapSquares([{ at: [0, 0], map: "a" }, square])).toThrow("World-space squares overlap")
})
it("rejects assigning one map to two different squares", () => {
  expect(() =>
    getWorldMapSquares([
      { at: [0, 0], map: "a" },
      { at: [1, 0], map: "a" },
    ]),
  ).toThrow("multiple squares")
})
