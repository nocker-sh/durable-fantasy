import { expect, it } from "vitest"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"

const box = { id: "first", origin: [0, 0, 0] satisfies [number, number, number], size: [0.2, 0.06, 0.2] satisfies [number, number, number] }
it("allows outer bounds to touch in a stack without assuming hollow nesting", () => {
  expect(getBoxLayoutError({ size: [0.3, 0.12, 0.3], boxes: [box, { ...box, id: "second", origin: [0, 0.06, 0] }], gap: 0 })).toBeNull()
})
it("rejects overlapped stacked objects and oversized contents", () => {
  expect(getBoxLayoutError({ size: [0.3, 0.12, 0.3], boxes: [box, { ...box, id: "second", origin: [0, 0.03, 0] }], gap: 0 })).toBeInstanceOf(Error)
  expect(getBoxLayoutError({ size: [0.1, 0.12, 0.3], boxes: [box], gap: 0 })).toBeInstanceOf(Error)
})
it("keeps explicit air space between objects", () => {
  const boxes = [box, { ...box, id: "second", origin: [0.21, 0, 0] satisfies [number, number, number] }]
  expect(getBoxLayoutError({ size: [0.5, 0.2, 0.3], boxes, gap: 0.02 })).toBeInstanceOf(Error)
  expect(getBoxLayoutError({ size: [0.5, 0.2, 0.3], boxes, gap: 0.01 })).toBeNull()
})
it("does not erase small solid overlaps with a fixed absolute tolerance", () => {
  const tiny = { ...box, size: [1e-10, 1e-10, 1e-10] satisfies [number, number, number] }
  expect(getBoxLayoutError({ size: [1, 1, 1], boxes: [tiny, { ...tiny, id: "second" }], gap: 0 })).toBeInstanceOf(Error)
})
it.each([NaN, Infinity, -1])("rejects invalid layout dimensions %s", (width) => {
  expect(getBoxLayoutError({ size: [width, 1, 1], boxes: [box], gap: 0 })).toBeInstanceOf(Error)
})
it("rejects duplicate identity and overflowing derived coordinates", () => {
  expect(getBoxLayoutError({ size: [1, 1, 1], boxes: [box, box], gap: 0 })).toBeInstanceOf(Error)
  expect(getBoxLayoutError({ size: [Number.MAX_VALUE, 1, 1], boxes: [{ ...box, origin: [Number.MAX_VALUE, 0, 0], size: [Number.MAX_VALUE, 0.1, 0.1] }], gap: 0 })).toBeInstanceOf(Error)
})
