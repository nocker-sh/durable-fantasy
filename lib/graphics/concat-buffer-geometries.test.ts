import { expect, it } from "vitest"
import { BufferAttribute, BufferGeometry } from "three"
import { concatBufferGeometries } from "#/lib/graphics/concat-buffer-geometries"

it("retains attribute values, normalized color storage and index offsets", () => {
  const geometries = [0, 1].map((index) => {
    const geometry = new BufferGeometry()
    geometry.setAttribute("position", new BufferAttribute(new Float32Array([index, 0, 0, index, 1, 0, index, 0, 1]), 3))
    geometry.setAttribute("color", new BufferAttribute(new Uint8Array([255, 0, 0, 0, 128, 0, 0, 0, 64]), 3, true))
    geometry.setAttribute("id", new BufferAttribute(new Int16Array([-1, 2, 3]), 1))
    geometry.setIndex([0, 2, 1])
    return geometry
  })
  const combined = concatBufferGeometries(geometries)
  expect(Array.from(combined.attributes.position.array)).toEqual([0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1])
  expect(combined.attributes.color.array).toBeInstanceOf(Uint8Array)
  expect(combined.attributes.color.normalized).toBe(true)
  expect(Array.from(combined.attributes.color.array)).toEqual([255, 0, 0, 0, 128, 0, 0, 0, 64, 255, 0, 0, 0, 128, 0, 0, 0, 64])
  expect(combined.attributes.id.array).toBeInstanceOf(Int16Array)
  expect(Array.from(combined.attributes.id.array)).toEqual([-1, 2, 3, -1, 2, 3])
  expect(Array.from(combined.index?.array ?? [])).toEqual([0, 2, 1, 3, 5, 4])
  combined.attributes.position.array[0] = 99
  expect(geometries[0].attributes.position.array[0]).toBe(0)
  expect(Array.from(geometries[1].index?.array ?? [])).toEqual([0, 2, 1])
})

it("keeps non-indexed geometry non-indexed", () => {
  const geometry = new BufferGeometry().setAttribute("position", new BufferAttribute(new Float32Array([1, 2, 3]), 3))
  const combined = concatBufferGeometries([geometry, geometry])
  expect(combined.index).toBeNull()
  expect(Array.from(combined.attributes.position.array)).toEqual([1, 2, 3, 1, 2, 3])
})

it("retains vertex offsets beyond the 16-bit index range", () => {
  const first = new BufferGeometry().setAttribute("position", new BufferAttribute(new Float32Array(65536 * 3), 3)).setIndex([0])
  const second = new BufferGeometry().setAttribute("position", new BufferAttribute(new Float32Array(3), 3)).setIndex([0])
  const combined = concatBufferGeometries([first, second])
  expect(combined.index?.array).toBeInstanceOf(Uint32Array)
  expect(Array.from(combined.index?.array ?? [])).toEqual([0, 65536])
})

it("rejects a missing first geometry", () => {
  expect(() => concatBufferGeometries([])).toThrow(RangeError)
})
