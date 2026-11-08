import { expect, it } from "vitest"
import { getCarryGaitFrame } from "#/world/town/get-carry-gait-frame"
it("plays the same complete loop in the opposite temporal order", () => {
  const reverse = Array.from({ length: 4 }, (_, phase) => getCarryGaitFrame({ phase, frameCount: 4, playback: "reverse" }))
  expect(reverse).toEqual([0, 3, 2, 1])
  expect(Array.from({ length: 4 }, (_, phase) => getCarryGaitFrame({ phase, frameCount: 4, playback: "forward" }))).toEqual([0, 1, 2, 3])
})
it("wraps both directions and negative clocks without negative frame indices", () => {
  expect(getCarryGaitFrame({ phase: -1, frameCount: 16, playback: "forward" })).toBe(15)
  expect(getCarryGaitFrame({ phase: -1, frameCount: 16, playback: "reverse" })).toBe(1)
  expect(getCarryGaitFrame({ phase: 17, frameCount: 16, playback: "reverse" })).toBe(15)
  expect(getCarryGaitFrame({ phase: -16, frameCount: 16, playback: "reverse" })).toBe(0)
})
it("rejects fractional or nonfinite phases and invalid loop lengths", () => {
  for (const phase of [NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1]) expect(getCarryGaitFrame({ phase, frameCount: 16, playback: "reverse" })).toEqual(new Error("Invalid carry gait phase"))
  for (const frameCount of [0, 1, 1.5, NaN]) expect(getCarryGaitFrame({ phase: 0, frameCount, playback: "forward" })).toEqual(new Error("Invalid carry gait phase"))
})
