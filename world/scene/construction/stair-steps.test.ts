import { expect, it } from "vitest"
import { stairSteps } from "./stair-steps"
const spec = { x0: 1, x1: 2.2, z0: 32, z1: 33.3, y0: -0.74, y1: 0.04, steps: 6 }
it("keeps every washing-place step above its foundation when rising from the ledge", () => {
  const steps = stairSteps(spec)
  expect(steps).toHaveLength(6)
  expect(steps.every((s) => s.bottom < s.top && s.x0 < s.x1 && s.z0 < s.z1)).toBe(true)
  expect(steps[0].bottom).toBeCloseTo(-1.14)
  expect(steps[0].top).toBeCloseTo(-0.61)
  expect(steps.at(-1)!.top).toBeCloseTo(spec.y1)
})
it("preserves descending terrace steps and their overlap", () => {
  const s = stairSteps({ ...spec, y0: 1.9, y1: 0.1, steps: 9 })
  expect(s[0].bottom).toBeCloseTo(-0.3)
  expect(s[0].z0).toBe(32)
  expect(s[0].z1).toBeCloseTo(32 + 1.3 / 9 + 0.02)
  expect(s.at(-1)!.top).toBeCloseTo(0.1)
})
it("supports stairs running north without inverting their boxes", () => {
  const s = stairSteps({ ...spec, z0: 33.3, z1: 32 })
  expect(s[0].z0).toBeCloseTo(33.3 - 1.3 / 6 - 0.02)
  expect(s.at(-1)!.z0).toBeCloseTo(31.98)
  expect(s.every((s) => s.z0 < s.z1 && s.bottom < s.top)).toBe(true)
})
it("rejects invalid geometry before generating mesh boxes", () => {
  for (const steps of [0, -1, 1.5, Infinity]) expect(() => stairSteps({ ...spec, steps })).toThrow(RangeError)
  expect(() => stairSteps({ ...spec, x1: spec.x0 })).toThrow(RangeError)
})
