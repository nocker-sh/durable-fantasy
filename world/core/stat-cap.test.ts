import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { MAX_LEVEL, MAX_STAT, START_STAT, STARTING_POINTS } from "#/world/core/growth-rules"
import { pointsForLevel } from "#/world/core/points-for-level"
import { statCost } from "#/world/core/stat-cost"
import { player } from "#/world/test/player"

it("puts the stat cap within reach of the points a character gets by the level cap", () => {
  const points = STARTING_POINTS + Array.from({ length: MAX_LEVEL - 1 }, (_, i) => pointsForLevel(i + 2)).reduce((a, b) => a + b, 0)
  const toCap = Array.from({ length: MAX_STAT - START_STAT }, (_, i) => statCost(START_STAT + i)).reduce((a, b) => a + b, 0)
  expect(toCap).toBeLessThan(points)
})

it("refuses to raise a stat past the cap", () => {
  const p = player({ statPoints: 5, stats: { ...player().stats, str: MAX_STAT } })
  expect(apply(p, { type: "raise", stat: "str" })).toEqual({ ok: false, reason: "STAT_MAX" })
  const below = apply({ ...p, stats: { ...p.stats, str: MAX_STAT - 1 } }, { type: "raise", stat: "str" })
  expect(below.ok && below.state.stats.str).toBe(MAX_STAT)
})
