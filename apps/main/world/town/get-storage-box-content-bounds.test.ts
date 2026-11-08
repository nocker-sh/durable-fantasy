import { expect, it } from "vitest"
import { getStorageBoxContentBounds } from "#/world/town/get-storage-box-content-bounds"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"

it("keeps inner origins above the physical bottom and inside both walls without mutating contents", () => {
  const contents: readonly LayoutBox[] = [{ id: "parcel", origin: [0.1, 0, 0.2], size: [0.3, 0.2, 0.1] }]
  const before = JSON.stringify(contents)
  const boxes = getStorageBoxContentBounds({ box: { x0: 2, x1: 3, y0: 0.4, y1: 0.9, z0: 4, z1: 4.5 }, wall: 0.025, contents })
  expect(boxes).toHaveLength(1)
  expect(boxes[0].x0).toBeCloseTo(2.125)
  expect(boxes[0].x1).toBeCloseTo(2.425)
  expect(boxes[0].bottom).toBeCloseTo(0.425)
  expect(boxes[0].top).toBeCloseTo(0.625)
  expect(boxes[0].z0).toBeCloseTo(4.225)
  expect(boxes[0].z1).toBeCloseTo(4.325)
  expect(JSON.stringify(contents)).toBe(before)
})
