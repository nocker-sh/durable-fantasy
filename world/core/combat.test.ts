import { startingStats } from "#/world/core/starting-stats"
import { describe, expect, it } from "vitest"
import { artSwing } from "#/world/core/art-swing"
import { deathPenalty } from "#/world/core/death-penalty"
import { hitChance } from "#/world/core/hit-chance"
import { swing } from "#/world/core/swing"
import type { Fighter } from "#/world/core/combat-types"

const sequence =
  (...values: number[]) =>
  () =>
    values.shift() ?? 0.5
const fighter = (patch: Partial<Fighter> = {}): Fighter => ({ atk: 20, def: 2, hit: 10, flee: 10, crit: 0, ...patch })

describe("combat", () => {
  it("keeps the chance to hit between 5 and 95 percent", () => {
    expect(hitChance({ hit: 10 }, { flee: 10 })).toBe(80)
    expect(hitChance({ hit: 0 }, { flee: 200 })).toBe(5)
    expect(hitChance({ hit: 200 }, { flee: 0 })).toBe(95)
  })

  it("misses when the roll is above the chance to hit", () => {
    expect(swing(fighter(), fighter(), sequence(0.99, 0.85))).toEqual({ kind: "miss" })
  })

  it("deals attack minus defence, at least 1", () => {
    expect(swing(fighter(), fighter(), sequence(0.99, 0.1, 0.5))).toEqual({ kind: "hit", damage: 18 })
    expect(swing(fighter({ atk: 1 }), fighter({ def: 50 }), sequence(0.99, 0.1, 0.5))).toEqual({ kind: "hit", damage: 1 })
  })

  it("a critical ignores evasion and hits 1.4 times as hard", () => {
    expect(swing(fighter({ crit: 50, hit: 0 }), fighter({ flee: 500 }), sequence(0.1, 0.5))).toEqual({ kind: "critical", damage: 26 })
  })

  it("dying costs 1% of the next level, except up to level 5 and at the cap", () => {
    expect(deathPenalty(6, 1234)).toBe(12)
    expect(deathPenalty(5, 1234)).toBe(0)
    expect(deathPenalty(16, 0)).toBe(0)
  })

  it("an art's blow: a strike harder, a sure one always critical, a spell from a stat that never misses", () => {
    const me = fighter({ atk: 10, hit: 0 }),
      them = fighter({ flee: 0, def: 4 })
    expect(artSwing({ art: { kind: "strike", power: 2 }, stats: startingStats(), attacker: me, target: them, random: sequence(0.99, 0.1, 0.5) })).toEqual({ kind: "hit", damage: 16 })
    expect(artSwing({ art: { kind: "strike", power: 1, sure: true }, stats: startingStats(), attacker: me, target: fighter({ flee: 500 }), random: sequence(0.99, 0.5) })).toEqual({
      kind: "critical",
      damage: 12,
    })
    expect(
      artSwing({
        art: { kind: "spell", magic: { base: 4, per: 1.5, stat: "int" } },
        stats: { ...startingStats(), int: 10 },
        attacker: me,
        target: fighter({ flee: 500, def: 4 }),
        random: sequence(0.5),
      }),
    ).toEqual({
      kind: "hit",
      damage: 17,
    })
  })
})
