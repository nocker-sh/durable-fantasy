import { expect, it } from "vitest"
import { runInNewContext } from "node:vm"
import { createAttributeArray } from "#/lib/graphics/create-attribute-array"
import type { TypedArray } from "three"

it.each([Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array])("preserves numeric attribute representation (%s)", (ArrayType) => {
  const source = new ArrayType([1, 2, 3])
  const array = createAttributeArray(source, 6)
  expect(array.constructor).toBe(ArrayType)
  expect(array.length).toBe(6)
  expect(Array.from(array)).toEqual([0, 0, 0, 0, 0, 0])
  expect(Array.from(source)).toEqual([1, 2, 3])
})

it("preserves a typed-array subclass", () => {
  class AttributeArray extends Float32Array {}
  expect(createAttributeArray(new AttributeArray(3), 6)).toBeInstanceOf(AttributeArray)
})

it("preserves a constructor from another realm", () => {
  const source: TypedArray = runInNewContext("new Float32Array([1, 2, 3])")
  const array = createAttributeArray(source, 6)
  expect(array.constructor).toBe(source.constructor)
  expect(array.length).toBe(6)
})
