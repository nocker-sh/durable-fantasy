import { expect, it } from "vitest"
import { getEasedSideStepSpeedBound } from "#/world/town/get-eased-side-step-speed-bound"
import { getEasedSideStepOffsets } from "#/world/town/get-eased-side-step-offsets"

it("encloses actual curved shoe and body displacements across both half-cycle boundaries", () => {
  const dimensions = { stride: 0.11, lift: 0.035 },
    bound = getEasedSideStepSpeedBound(dimensions)
  if (bound instanceof Error) throw bound
  for (const direction of ["left", "right"] satisfies ("left" | "right")[]) {
    const phases = [0, 0.001, 0.01, 0.1, 0.249, 0.25, 0.499, 0.5, 0.501, 0.75, 0.99, 0.999, 1]
    for (const index of phases.keys()) {
      if (!index) continue
      const from = getEasedSideStepOffsets({ ...dimensions, direction, phase: phases[index - 1] }),
        to = getEasedSideStepOffsets({ ...dimensions, direction, phase: phases[index] }),
        elapsed = phases[index] - phases[index - 1]
      if (from instanceof Error || to instanceof Error) throw new Error("Missing actual side-step offsets")
      expect(Math.abs(to.body - from.body)).toBeLessThanOrEqual(bound.body * elapsed)
      for (const side of ["l", "r"] satisfies ("l" | "r")[]) expect(Math.hypot(...to[side].map((value, axis) => value - from[side][axis]))).toBeLessThanOrEqual(bound.foot * elapsed)
    }
  }
})

it("refuses invalid dimensions and overflow rather than returning an unusable bound", () => {
  for (const stride of [0, -1, NaN, Infinity]) expect(getEasedSideStepSpeedBound({ stride, lift: 0.035 })).toBeInstanceOf(Error)
  expect(getEasedSideStepSpeedBound({ stride: 1e308, lift: 1e308 })).toBeInstanceOf(Error)
})
