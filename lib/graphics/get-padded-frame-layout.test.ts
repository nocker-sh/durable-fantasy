import { expect, it } from "vitest"
import { getPaddedFrameLayout } from "./get-padded-frame-layout"
it("extends size and anchor by the same transparent margin", () => {
  expect(getPaddedFrameLayout({ width: 76, height: 100, originX: 38, originY: 92, padding: 12 })).toEqual({ width: 100, height: 124, originX: 50, originY: 104, padding: 12 })
})
it("rejects invalid margins and excessive allocations before drawing", () => {
  for (const padding of [-1, 0.5, NaN, 1000000]) expect(getPaddedFrameLayout({ width: 76, height: 100, originX: 38, originY: 92, padding })).toBeInstanceOf(Error)
})
