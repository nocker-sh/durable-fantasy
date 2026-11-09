import { expect, it } from "vitest"
import { getSideStepPlan } from "#/world/town/get-side-step-plan"
import { getSideStepState } from "#/world/town/get-side-step-state"
import { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
it.each([3.25, 0.72, 0.03, 0.36])("finishes distance %s with both feet collected and no step above its authored maximum", (distance) => {
  const plan = getSideStepPlan({ from: [3.3, 6.25], to: [3.3, 6.25 - distance], turn: 3, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  expect(plan.stride).toBeLessThanOrEqual(0.12)
  expect(plan.cycles * plan.stride).toBeCloseTo(distance, 12)
  const start = getSideStepState({ plan, progress: 0 }),
    end = getSideStepState({ plan, progress: 1 })
  if (start instanceof Error || end instanceof Error) throw new Error("Missing side-step endpoints")
  expect(start.body).toEqual(plan.from)
  expect(end.body).toEqual(plan.to)
  expect(end.phase).toBe(1)
  const feet = getSideStepOffsets({ phase: end.phase, stride: end.stride, lift: 0.05, direction: end.direction })
  if (feet instanceof Error) throw feet
  expect([...feet.l, ...feet.r]).toEqual([0, 0, 0, 0, 0, 0])
})
it("uses complete cycles while moving right as well as left", () => {
  const plan = getSideStepPlan({ from: [0, 0], to: [-0.5, 0], turn: 0, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  expect(plan.direction).toBe("right")
  for (const cycle of Array.from({ length: plan.cycles - 1 }, (_, index) => index + 1)) {
    const state = getSideStepState({ plan, progress: cycle / plan.cycles })
    if (state instanceof Error) throw state
    expect(state.phase).toBeCloseTo(0, 12)
  }
})
it("rejects invalid progress, unsupported movement and unreasonable cycle counts", () => {
  expect(getSideStepPlan({ from: [0, 0], to: [0, 1], turn: 0, maxStride: 0.12 })).toBeInstanceOf(Error)
  expect(getSideStepPlan({ from: [0, 0], to: [1, 0], turn: 0, maxStride: 1e-10 })).toBeInstanceOf(Error)
  const plan = getSideStepPlan({ from: [0, 0], to: [1, 0], turn: 0, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  for (const progress of [-0.1, 1.1, NaN]) expect(getSideStepState({ plan, progress })).toBeInstanceOf(Error)
})
