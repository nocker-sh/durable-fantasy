import { expect, it } from "vitest"
import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapSpace } from "#/world/maps/map-space-types"

const fixture = (): MapSpace => ({ parentMap: "outside", frame: { origin: [100, 5, 200], width: 8, depth: 6, quarterTurns: 1 }, planarOrigin: [10, 20], metresPerPlanarUnit: 0.5 })
it("keeps the validated frame independent from its source", () => {
  const space = fixture(),
    original = structuredClone(space),
    frame = getMapSpaceFrame(space)
  expect(frame.toWorld([1, 2, 3])).toEqual([103, 7, 207])
  expect(space).toEqual(original)
  Object.assign(space.frame, { origin: [0, 0, 0] })
  expect(frame.toWorld([1, 2, 3])).toEqual([103, 7, 207])
})
it.each([0, -1, NaN, Infinity])("rejects a nonphysical planar scale %s", (metresPerPlanarUnit) => {
  expect(() => getMapSpaceFrame({ ...fixture(), metresPerPlanarUnit })).toThrow("planar scale")
})
it.each([NaN, Infinity, -Infinity])("rejects a nonfinite planar origin %s", (value) => {
  expect(() => getMapSpaceFrame({ ...fixture(), planarOrigin: [value, 20] })).toThrow("planar origin")
})
it.each([[], [10], [10, 20, 30]].map((value) => ({ value })))("rejects a runtime planar origin with the wrong dimension: %j", (input) => {
  const space = fixture()
  Object.assign(space, { planarOrigin: input.value })
  expect(() => getMapSpaceFrame(space)).toThrow("planar origin")
})
