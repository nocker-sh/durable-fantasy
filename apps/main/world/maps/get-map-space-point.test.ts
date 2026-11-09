import { expect, it } from "vitest"
import { getMapSpacePoint } from "#/world/maps/get-map-space-point"
import { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { Vector3 } from "#/lib/engine/vector3-types"
import type { MapSpace } from "#/world/maps/map-space-types"

const fixture = (quarterTurns: number): MapSpace => ({ parentMap: "parent", frame: { origin: [100, 5, 200], width: 8, depth: 6, quarterTurns }, planarOrigin: [10, 20], metresPerPlanarUnit: 0.5 })
const cases: readonly { quarterTurns: number; expected: Vector3 }[] = [
  { quarterTurns: 0, expected: [101, 7, 202] },
  { quarterTurns: 1, expected: [102, 7, 207] },
  { quarterTurns: 2, expected: [107, 7, 204] },
  { quarterTurns: 3, expected: [104, 7, 201] },
]
it.each(cases)("converts planar units and metric height under rotation $quarterTurns", (input) => {
  const space = fixture(input.quarterTurns),
    original = structuredClone(space)
  const point = getMapSpacePoint({ space, point: [12, 24], heightMetres: 2 })
  expect(point).toEqual(input.expected)
  expect(new SpatialFrame(space.frame).toLocal(point)).toEqual([1, 2, 2])
  expect(space).toEqual(original)
})
it.each([0, -1, Infinity, NaN])("rejects an invalid planar scale %s", (metresPerPlanarUnit) => {
  expect(() => getMapSpacePoint({ space: { ...fixture(0), metresPerPlanarUnit }, point: [12, 24], heightMetres: 2 })).toThrow(RangeError)
})
it("rejects nonfinite planar or height inputs", () => {
  expect(() => getMapSpacePoint({ space: fixture(0), point: [Infinity, 24], heightMetres: 2 })).toThrow(RangeError)
  expect(() => getMapSpacePoint({ space: fixture(0), point: [12, 24], heightMetres: Infinity })).toThrow(RangeError)
})
it("rejects extra coordinate components instead of silently dropping them", () => {
  const point: [number, number] = [12, 24]
  Reflect.set(point, 2, 99)
  expect(() => getMapSpacePoint({ space: fixture(0), point, heightMetres: 2 })).toThrow(RangeError)
})
it("rejects coercible coordinates and heights", () => {
  const point: [number, number] = [12, 24],
    input = { space: fixture(0), point, heightMetres: 2 }
  Reflect.set(point, 0, "12")
  expect(() => getMapSpacePoint(input)).toThrow(RangeError)
  Reflect.set(point, 0, 12)
  Reflect.set(input, "heightMetres", null)
  expect(() => getMapSpacePoint(input)).toThrow(RangeError)
})
