import { expect, it } from "vitest"
import { LIFE_FINAL } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { lifeLevel } from "#/world/core/life-level"

// The published progression formula, independent of the lookup implementation.
const totalAt = (level: number) => Array.from({ length: level }, (_, i) => Math.round(40 * (i + 1) ** 1.5)).reduce((sum, n) => sum + n, 0)

it("preserves every threshold and both sides of it through the final skill level", () => {
  for (let level = 1; level <= LIFE_FINAL; level++) {
    const exp = totalAt(level)
    expect(lifeExpAt(level)).toBe(exp)
    expect(lifeLevel(exp - 1)).toBe(level - 1)
    expect(lifeLevel(exp)).toBe(level)
    expect(lifeLevel(exp + 1)).toBe(level)
  }
  expect(lifeExpAt(0)).toBe(0)
  expect(lifeExpAt(LIFE_FINAL + 1)).toBe(totalAt(LIFE_FINAL + 1))
  expect(lifeExpAt(LIFE_FINAL + 2)).toBe(totalAt(LIFE_FINAL + 2))
})

it("preserves progress between thresholds, empty experience, and the final cap", () => {
  for (let level = 0; level < LIFE_FINAL; level++) {
    const from = totalAt(level)
    const until = totalAt(level + 1)
    for (const fraction of [0, 0.25, 0.5, 0.75]) expect(lifeLevel(Math.floor(from + (until - from) * fraction))).toBe(level)
  }
  for (const exp of [-1, 0, NaN]) expect(lifeLevel(exp)).toBe(0)
  expect(lifeLevel(Infinity)).toBe(LIFE_FINAL)
  expect(lifeLevel(Number.MAX_SAFE_INTEGER)).toBe(LIFE_FINAL)
})
