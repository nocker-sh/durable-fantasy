import { expect, it } from "vitest"
import { getSideStepPlan } from "#/world/town/get-side-step-plan"
import { getSideStepTiming } from "#/world/town/get-side-step-timing"
import { getTimedSideStepState } from "#/world/town/get-timed-side-step-state"
import { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
it.each([0.03, 0.72, 3.25])("keeps distance %s within speed and acceleration limits on one shared body/foot clock", (distance) => {
  const plan = getSideStepPlan({ from: [3.3, 6.25], to: [3.3, 6.25 - distance], turn: 3, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  const timing = getSideStepTiming({ plan, minCycleMs: 800, maxSpeed: 0.25, maxAcceleration: 0.2 })
  if (timing instanceof Error) throw timing
  expect(timing.durationMs).toBeGreaterThanOrEqual(plan.cycles * 800)
  for (const fraction of Array.from({ length: 101 }, (_, index) => index / 100)) {
    const state = getTimedSideStepState({ timing, elapsedMs: timing.durationMs * fraction })
    if (state instanceof Error) throw state
    expect(state.speed).toBeLessThanOrEqual(0.25 + 1e-12)
    expect(state.speed / plan.stride).toBeLessThanOrEqual(1000 / 800 + 1e-12)
    expect(Math.abs(state.acceleration)).toBeLessThanOrEqual(0.2 + 1e-12)
    const feet = getSideStepOffsets({ phase: state.phase, stride: state.stride, lift: 0.05, direction: state.direction })
    if (feet instanceof Error) throw feet
    expect(6.25 - state.body[1]).toBeCloseTo((state.cycle + state.phase) * plan.stride, 12)
    if (fraction === 0 || fraction === 1) {
      expect([state.speed, state.acceleration]).toEqual([0, 0])
      expect([...feet.l, ...feet.r]).toEqual([0, 0, 0, 0, 0, 0])
    }
  }
})
it("rejects invalid timing limits and clocks instead of returning invalid phases", () => {
  const plan = getSideStepPlan({ from: [0, 0], to: [1, 0], turn: 0, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  expect(getSideStepTiming({ plan, minCycleMs: 0, maxSpeed: 0.25, maxAcceleration: 0.2 })).toBeInstanceOf(Error)
  const timing = getSideStepTiming({ plan, minCycleMs: 800, maxSpeed: 0.25, maxAcceleration: 0.2 })
  if (timing instanceof Error) throw timing
  expect(getTimedSideStepState({ timing, elapsedMs: NaN })).toBeInstanceOf(Error)
})
it("reports derivatives that agree with the actual body displacement", () => {
  const plan = getSideStepPlan({ from: [0, 0], to: [1, 0], turn: 0, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  const timing = getSideStepTiming({ plan, minCycleMs: 800, maxSpeed: 0.25, maxAcceleration: 0.2 })
  if (timing instanceof Error) throw timing
  for (const fraction of [0.2, 0.5, 0.8]) {
    const time = timing.durationMs * fraction
    const a = getTimedSideStepState({ timing, elapsedMs: time - 1 }),
      middle = getTimedSideStepState({ timing, elapsedMs: time }),
      b = getTimedSideStepState({ timing, elapsedMs: time + 1 })
    if (a instanceof Error || b instanceof Error || middle instanceof Error) throw new Error("Missing timed motion")
    expect((b.body[0] - a.body[0]) / 0.002).toBeCloseTo(middle.speed, 6)
    expect((b.speed - a.speed) / 0.002).toBeCloseTo(middle.acceleration, 6)
  }
  for (const time of [-1, timing.durationMs + 1]) {
    const state = getTimedSideStepState({ timing, elapsedMs: time })
    if (state instanceof Error) throw state
    expect([state.speed, state.acceleration]).toEqual([0, 0])
  }
})
it("respects speed and acceleration limits when either one determines the duration", () => {
  const plan = getSideStepPlan({ from: [0, 0], to: [1, 0], turn: 0, maxStride: 0.12 })
  if (plan instanceof Error) throw plan
  const slow = getSideStepTiming({ plan, minCycleMs: 1, maxSpeed: 0.1, maxAcceleration: 100 })
  const gentle = getSideStepTiming({ plan, minCycleMs: 1, maxSpeed: 100, maxAcceleration: 0.1 })
  if (slow instanceof Error || gentle instanceof Error) throw new Error("Missing limited timings")
  const fastest = getTimedSideStepState({ timing: slow, elapsedMs: slow.durationMs / 2 })
  const accelerating = getTimedSideStepState({ timing: gentle, elapsedMs: (gentle.durationMs * (3 - Math.sqrt(3))) / 6 })
  if (fastest instanceof Error || accelerating instanceof Error) throw new Error("Missing extrema")
  expect(fastest.speed).toBeCloseTo(0.1, 12)
  expect(accelerating.acceleration).toBeCloseTo(0.1, 12)
  expect(getSideStepTiming({ plan, minCycleMs: Number.MAX_VALUE, maxSpeed: 1, maxAcceleration: 1 })).toBeInstanceOf(Error)
})
