import { expect, it } from "vitest"
import { createHeightfieldVertices } from "#/lib/graphics/create-heightfield-vertices"

it("keeps row-major heights and places both texture axes at their matching corners", () => {
  const heights = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8])
  const mesh = createHeightfieldVertices({ size: 1, resolution: 2, heights })
  expect(mesh.side).toBe(3)
  expect(Array.from(mesh.positions)).toEqual([0, 0, 0, 0.5, 1, 0, 1, 2, 0, 0, 3, 0.5, 0.5, 4, 0.5, 1, 5, 0.5, 0, 6, 1, 0.5, 7, 1, 1, 8, 1])
  expect(Array.from(mesh.uv)).toEqual([0, 1, 0.5, 1, 1, 1, 0, 0.5, 0.5, 0.5, 1, 0.5, 0, 0, 0.5, 0, 1, 0])
  expect(Array.from(heights)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
})

it("accepts negative elevations and retains the source's Float32 height values", () => {
  const heights = new Float32Array([-0.7, 0.1, 2.3, -1])
  const mesh = createHeightfieldVertices({ size: 2, resolution: 0.5, heights })
  expect([mesh.positions[1], mesh.positions[4], mesh.positions[7], mesh.positions[10]]).toEqual(Array.from(heights))
  expect(Array.from(mesh.positions.slice(-3))).toEqual([2, -1, 2])
})

it.each([0, -1, 0.5, NaN, Infinity])("rejects an invalid grid size %s", (size) => {
  expect(() => createHeightfieldVertices({ size, resolution: 1, heights: [] })).toThrow(RangeError)
})

it.each([0, -1, NaN, Infinity])("rejects invalid resolution %s", (resolution) => {
  expect(() => createHeightfieldVertices({ size: 1, resolution, heights: [] })).toThrow(RangeError)
})

it("rejects missing and surplus height samples", () => {
  expect(() => createHeightfieldVertices({ size: 1, resolution: 1, heights: [0, 0, 0] })).toThrow(RangeError)
  expect(() => createHeightfieldVertices({ size: 1, resolution: 1, heights: [0, 0, 0, 0, 0] })).toThrow(RangeError)
})
