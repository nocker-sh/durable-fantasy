import type { TypedArray } from "three"

const ARRAY_TAGS = new Set(["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array"].map((name) => `[object ${name}]`))
const isAttributeArray = (array: unknown): array is TypedArray => ArrayBuffer.isView(array) && ARRAY_TAGS.has(Object.prototype.toString.call(array))

/** Preserve the source's element representation and constructor, including typed-array subclasses and other realms. */
export function createAttributeArray(source: TypedArray, length: number): TypedArray {
  const array: unknown = Reflect.construct(source.constructor, [length])
  if (!isAttributeArray(array)) throw new TypeError("Geometry attribute constructor must return a numeric typed array")
  return array
}
