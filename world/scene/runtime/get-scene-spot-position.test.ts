import { expect, it } from "vitest"
import { getSceneSpotPosition } from "#/world/scene/runtime/get-scene-spot-position"

it("rejects absent, off-map and unregistered named places", () => {
  expect(getSceneSpotPosition(null, "town", {})).toBeNull()
  expect(getSceneSpotPosition({ map: "other", tile: [2, 3] }, "town", {})).toBeNull()
  expect(getSceneSpotPosition({ map: "town", place: "well" }, "town", {})).toBeNull()
})

it("uses the registered place and copies tiles while converting half-tile cell centers", () => {
  const places = { well: [2, 3] satisfies [number, number] }
  expect(getSceneSpotPosition({ map: "town", place: "well" }, "town", places)).toBe(places.well)
  const tile: [number, number] = [2, 3]
  const position = getSceneSpotPosition({ map: "town", tile }, "town", {})
  expect(position).toEqual(tile)
  expect(position).not.toBe(tile)
  expect(getSceneSpotPosition({ map: "town", cell: [4, 6] }, "town", {})).toEqual([2.25, 3.25])
})
