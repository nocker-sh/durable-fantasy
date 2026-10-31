import { expect, it } from "vitest"
import { assertFiniteEnvelope } from "#/scripts/lib/assert-finite-envelope"

it("keeps finite coordinates, optional metadata and existing references unchanged", () => {
  const point = [-2, 0, 3]
  const exterior = { door: { point }, windows: [], roof: "roof", optional: undefined, extra: null }
  assertFiniteEnvelope(exterior)
  expect(exterior.door.point).toBe(point)
  expect(point).toEqual([-2, 0, 3])
})

it.each([NaN, Infinity, -Infinity])("rejects %s inside nested coordinate arrays with its field path", (invalid) => {
  expect(() => assertFiniteEnvelope({ windows: [{ point: [0, invalid] }] })).toThrow("exterior.windows.0.point.1")
})

it("also rejects a nonfinite top-level numeric value", () => {
  expect(() => assertFiniteEnvelope(Infinity)).toThrow(RangeError)
})
