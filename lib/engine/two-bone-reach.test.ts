import { expect, it } from "vitest"
import { twoBoneSegmentReach } from "#/lib/engine/two-bone-segment-reach"
it("rejects an inner unreachable interval even though both endpoints are reachable", () => {
  expect(twoBoneSegmentReach({ root: [0, 0, 0], from: [-2, 0, 0], to: [2, 0, 0], upper: 2, lower: 1 })).toBe(false)
  expect(twoBoneSegmentReach({ root: [0, 0, 0], from: [-1.5, 0.5, 0], to: [1.5, 0.5, 0], upper: 2, lower: 1 })).toBe(false)
})
it("accepts whole reachable segments, folded chains and point targets", () => {
  expect(twoBoneSegmentReach({ root: [0, 0, 0], from: [1.2, 0, 0], to: [2, 1, 0], upper: 2, lower: 1 })).toBe(true)
  expect(twoBoneSegmentReach({ root: [0, 0, 0], from: [1, 0, 0], to: [1, 0, 0], upper: 2, lower: 1 })).toBe(true)
  expect(twoBoneSegmentReach({ root: [0, 0, 0], from: [-1, 0, 0], to: [1, 0, 0], upper: 1, lower: 1 })).toBe(true)
  expect(twoBoneSegmentReach({ root: [0, 0, 0], from: [1, 0, 0], to: [4, 0, 0], upper: 2, lower: 1 })).toBe(false)
  expect(() => twoBoneSegmentReach({ root: [0, 0, 0], from: [1, 0, 0], to: [2, 0, 0], upper: 0, lower: 1 })).toThrow("Invalid")
})
