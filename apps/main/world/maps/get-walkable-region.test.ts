import { expect, it } from "vitest"
import { getWalkableRegion } from "#/world/maps/get-walkable-region"

it("refuses a mismatched visitation buffer instead of repeating unrecorded visits", () => {
  expect(() => getWalkableRegion({ size: 2, rows: ["..", ".."] }, 0, new Uint8Array(0))).toThrow("Invalid walk region visitation grid")
})
it("does not seed a component from blocked, out-of-range or already visited cells", () => {
  const map = { size: 2, rows: [".#", "##"] },
    seen = new Uint8Array(4)
  expect(getWalkableRegion(map, 1, seen).size).toBe(0)
  expect(getWalkableRegion(map, 4, seen).size).toBe(0)
  expect([...getWalkableRegion(map, 0, seen)]).toEqual([0])
  expect(getWalkableRegion(map, 0, seen).size).toBe(0)
})
