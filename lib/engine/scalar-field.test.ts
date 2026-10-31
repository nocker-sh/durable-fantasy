import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"

it("does not expose a writable backing array to field consumers", () => {
  const field = new ScalarField({ samples: new Float32Array([0, 1, 2, 3]), size: 2 })
  expect("data" in field).toBe(false)
})
it("keeps the field's metadata fixed", () => {
  const field = new ScalarField({ samples: new Float32Array([0, 1, 2, 3]), size: 2 })
  expect(Object.isFrozen(field)).toBe(true)
  expect(Reflect.set(field, "size", 3)).toBe(false)
  expect(field.size).toBe(2)
})
it("captures the input descriptor while retaining the owner's live sample storage", () => {
  const samples = new Float32Array([0, 2, 4, 6]),
    props = { samples, size: 2, resolution: 1 },
    field = new ScalarField(props)
  props.samples = new Float32Array(9).fill(99)
  props.size = 3
  props.resolution = 8
  expect(field.sample(0.5, 0.5)).toBe(3)
  expect([field.size, field.resolution, field.sampleCount]).toEqual([2, 1, 4])
  samples.fill(7)
  expect(field.sample(0.5, 0.5)).toBe(7)
})
it("retains the default resolution and exposes only the numeric sample count", () => {
  const field = new ScalarField({ samples: new Float32Array([0, 4, 8, 12]), size: 2 })
  expect(field.resolution).toBe(1)
  expect(field.sampleCount).toBe(4)
  expect(field.sample(0.25, 0.5)).toBe(5)
})
it.each([0, 1, -2, 2.5, NaN, Infinity, Number.MAX_SAFE_INTEGER])("rejects invalid grid size %s", (size) => {
  expect(() => new ScalarField({ samples: new Float32Array(9), size })).toThrow(RangeError)
})
it.each([0, -1, NaN, Infinity])("rejects invalid resolution %s", (resolution) => {
  expect(() => new ScalarField({ samples: new Float32Array(9), size: 3, resolution })).toThrow(RangeError)
})
it("rejects incomplete or wrongly typed sample buffers", () => {
  expect(() => new ScalarField({ samples: new Float32Array(3), size: 2 })).toThrow(RangeError)
  const props = { samples: new Float32Array(4), size: 2 }
  Reflect.set(props, "samples", new Float64Array(4))
  expect(() => new ScalarField(props)).toThrow(RangeError)
})
it("does not coerce null or string metadata into a valid field", () => {
  const props = { samples: new Float32Array(4), size: 2, resolution: 1 }
  Reflect.set(props, "resolution", null)
  expect(() => new ScalarField(props)).toThrow(RangeError)
  Reflect.set(props, "resolution", "1")
  expect(() => new ScalarField(props)).toThrow(RangeError)
  Reflect.set(props, "resolution", 1)
  Reflect.set(props, "size", "2")
  expect(() => new ScalarField(props)).toThrow(RangeError)
})
