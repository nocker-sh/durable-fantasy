import { expect, it } from "vitest"
import { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
it.each(Array<"left" | "right">("left", "right"))("plants the trailing foot, then the leading foot, while stepping %s", (direction) => {
  for (const phase of Array.from({ length: 101 }, (_, index) => index / 100)) {
    const step = getSideStepOffsets({ phase, stride: 0.12, lift: 0.05, direction })
    if (step instanceof Error) throw step
    const leading = direction === "left" ? step.l : step.r,
      trailing = direction === "left" ? step.r : step.l,
      end = direction === "left" ? 0.12 : -0.12
    if (phase <= 0.5) {
      expect(trailing[0] + step.body).toBeCloseTo(0, 12)
      expect(trailing[1]).toBe(0)
    }
    if (phase >= 0.5) {
      expect(leading[0] + step.body).toBeCloseTo(end, 12)
      expect(leading[1]).toBe(0)
    }
    expect(step.l[1]).toBeGreaterThanOrEqual(0)
    expect(step.r[1]).toBeGreaterThanOrEqual(0)
  }
})
it("closes each cycle and rejects invalid dimensions instead of inventing a step", () => {
  for (const phase of [0, 1]) {
    const step = getSideStepOffsets({ phase, stride: 0.12, lift: 0.05, direction: "left" })
    if (step instanceof Error) throw step
    expect([...step.l, ...step.r]).toEqual([0, 0, 0, 0, 0, 0])
  }
  for (const phase of [-0.1, 1.1, NaN]) expect(getSideStepOffsets({ phase, stride: 0.12, lift: 0.05, direction: "left" })).toBeInstanceOf(Error)
  expect(getSideStepOffsets({ phase: 0.5, stride: 0, lift: 0.05, direction: "left" })).toBeInstanceOf(Error)
})
