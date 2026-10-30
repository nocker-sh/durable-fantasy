import { expect, it } from "vitest"
import { getHorizontalBounds } from "#/lib/graphics/ray/get-horizontal-bounds"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
const primitive: Primitive = { kind: "sdf", a: [0, 0, 0], b: [0, 0, 0], r: 4, r2: 0, m: createSolidSurfaceMaterial("redsand"), id: 0, bounds: { min: [-1, 0, -2], max: [1, 1, 2] } }
it("rotates all four corners and unions separate parts at the physical scale", () => {
  const bounds = getHorizontalBounds({ primitives: [primitive], position: [10, 20], heading: Math.PI / 4, scale: 2 })
  if (bounds instanceof Error) throw bounds
  const extent = 3 * Math.SQRT2
  expect(bounds[0]).toBeCloseTo(10 - extent, 12)
  expect(bounds[1]).toBeCloseTo(20 - extent, 12)
  expect(bounds[2]).toBeCloseTo(10 + extent, 12)
  expect(bounds[3]).toBeCloseTo(20 + extent, 12)
  expect(getHorizontalBounds({ primitives: [primitive, { ...primitive, bounds: { min: [4, 0, 0], max: [5, 1, 1] } }], position: [0, 0], heading: 0, scale: 1 })).toEqual([-1, -2, 5, 2])
})
it("refuses invalid vertical bounds as well as invalid horizontal transforms", () => {
  const props = { primitives: [primitive], position: [0, 0] satisfies [number, number], heading: 0, scale: 1 }
  expect(getHorizontalBounds({ ...props, primitives: [] })).toBeInstanceOf(Error)
  expect(getHorizontalBounds({ ...props, scale: 0 })).toBeInstanceOf(Error)
  expect(getHorizontalBounds({ ...props, heading: NaN })).toBeInstanceOf(Error)
  expect(getHorizontalBounds({ ...props, primitives: [{ ...primitive, bounds: { min: [-1, 2, -2], max: [1, 1, 2] } }] })).toBeInstanceOf(Error)
  expect(getHorizontalBounds({ ...props, primitives: [{ ...primitive, bounds: { min: [-1, NaN, -2], max: [1, 1, 2] } }] })).toBeInstanceOf(Error)
})
