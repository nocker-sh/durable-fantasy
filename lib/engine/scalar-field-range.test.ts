import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { scalarFieldRange } from "#/lib/engine/scalar-field-range"
it("finds a peak and a hollow inside a rectangle whose corners miss both", () => {
  const field = new ScalarField({ samples: new Float32Array([0, 0, 0, 0, 0, 9, -4, 0, 0, 0, 0, 0, 0, 0, 0, 0]), size: 4 })
  expect(scalarFieldRange(field, [0.2, 0.2, 2.7, 2.7])).toEqual({ min: -4, max: 9 })
})
it("includes clipped grid edges and respects resolution without changing field data", () => {
  const samples = new Float32Array([0, 0, 0, 0, 8, 0, 0, 0, 0]),
    field = new ScalarField({ samples, size: 3, resolution: 2 }),
    before = [...samples]
  const result = scalarFieldRange(field, [0.25, 0.25, 0.375, 0.75])
  expect(result.min).toBeCloseTo(2)
  expect(result.max).toBeCloseTo(6)
  expect([...samples]).toEqual(before)
})
it("uses the sampler's clamped boundaries even for a rectangle outside the field", () => {
  const field = new ScalarField({ samples: new Float32Array([1, 2, 3, 4]), size: 2 })
  expect(scalarFieldRange(field, [-3, -4, -1, -2])).toEqual({ min: 1, max: 1 })
  const edge = field.sample(9, 9)
  expect(scalarFieldRange(field, [3, 3, 9, 9])).toEqual({ min: edge, max: edge })
})
it("rejects malformed geometry and non-finite sampled values", () => {
  const samples = new Float32Array(9),
    field = new ScalarField({ samples, size: 3 })
  expect(() => scalarFieldRange(field, [2, 0, 1, 1])).toThrow(RangeError)
  expect(() => scalarFieldRange(field, [0, 0, NaN, 1])).toThrow(RangeError)
  expect(() => scalarFieldRange(new ScalarField({ samples: new Float32Array(9), size: 3, resolution: 0 }), [0, 0, 1, 1])).toThrow(RangeError)
  samples[4] = NaN
  expect(() => scalarFieldRange(field, [0, 0, 1.5, 1.5])).toThrow("Non-finite scalar field value")
})
