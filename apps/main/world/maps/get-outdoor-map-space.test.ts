import { expect, it } from "vitest"
import { getOutdoorMapSpace } from "#/world/maps/get-outdoor-map-space"
import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { WORLD_SPACE_ROOT } from "#/world/maps/world-space-rules"
import { TILE_M } from "#/world/town/fit"

it("derives the full metric span and placement from walk cells, keeping height in metres", () => {
  const space = getOutdoorMapSpace({ id: "map", size: 96 }, { map: "map", at: [2, 3] })
  expect(space.parentMap).toBe(WORLD_SPACE_ROOT)
  expect(space.frame.width).toBe(48 * TILE_M)
  expect(space.frame.depth).toBe(48 * TILE_M)
  expect(space.frame.origin[0]).toBeCloseTo(2 * 48 * TILE_M, 12)
  expect(space.frame.origin[1]).toBe(0)
  expect(space.frame.origin[2]).toBeCloseTo(3 * 48 * TILE_M, 12)
  const point = getMapSpacePoint({ space, point: [1, 2], heightMetres: 7 })
  expect(point[0]).toBeCloseTo(2 * 48 * TILE_M + TILE_M, 12)
  expect(point[1]).toBe(7)
  expect(point[2]).toBeCloseTo(3 * 48 * TILE_M + 2 * TILE_M, 12)
})
it.each([0, -1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid grid size %s", (size) => {
  expect(() => getOutdoorMapSpace({ id: "map", size }, { map: "map", at: [0, 0] })).toThrow("Invalid outdoor map space")
})
it("rejects mismatched reservations and invalid positions at the direct boundary", () => {
  expect(() => getOutdoorMapSpace({ id: "map", size: 96 }, { map: "other", at: [0, 0] })).toThrow("Invalid outdoor map space")
  expect(() => getOutdoorMapSpace({ id: "map", size: 96 }, { map: "map", at: [-1, 0] })).toThrow("Invalid world-space square")
})
