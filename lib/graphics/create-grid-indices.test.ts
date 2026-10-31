import { expect, it } from "vitest"
import { Vector3 } from "three"
import { createGridIndices } from "#/lib/graphics/create-grid-indices"

it("orients both cell triangles upward", () => {
  const indices = createGridIndices(2)
  expect(indices).toEqual([0, 2, 1, 1, 2, 3])
  const points = [new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1), new Vector3(1, 0, 1)]
  for (const start of [0, 3]) {
    const a = points[indices[start]]
    const b = points[indices[start + 1]]
    const c = points[indices[start + 2]]
    expect(b.clone().sub(a).cross(c.clone().sub(a)).y).toBe(1)
  }
})

it("starts a new row without creating a cell across the preceding row's edge", () => {
  const indices = createGridIndices(3)
  expect(indices).toEqual([0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5, 3, 6, 4, 4, 6, 7, 4, 7, 5, 5, 7, 8])
  expect(Math.max(...indices)).toBe(8)
})

it.each([0, 1, -2, 2.5, NaN, Infinity])("rejects invalid side length %s", (side) => {
  expect(() => createGridIndices(side)).toThrow(RangeError)
})
