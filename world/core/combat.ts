// Auto-attack resolution (game-system.md §8). The server rolls on its own clock; randomness is
// passed in so tests can pin it.
import type { Stats } from "./growth.ts"
import type { OffensiveEffect } from "./skills.ts"

export type Random = () => number

export interface Fighter {
  atk: number
  def: number
  hit: number
  flee: number
  crit: number
}

export type Swing = { kind: "miss" } | { kind: "hit" | "critical"; damage: number }

/** Chance to hit in percent, kept between 5 and 95. */
export function hitChance(attacker: Pick<Fighter, "hit">, target: Pick<Fighter, "flee">): number {
  return Math.min(95, Math.max(5, 80 + attacker.hit - target.flee))
}

/** One swing: a critical ignores evasion and hits 1.4 times as hard; otherwise roll to hit. */
export function swing(attacker: Fighter, target: Fighter, random: Random): Swing {
  const critical = random() * 100 < attacker.crit
  if (!critical && random() * 100 >= hitChance(attacker, target)) return { kind: "miss" }
  const roll = 0.9 + random() * 0.2
  const raw = attacker.atk * roll * (critical ? 1.4 : 1) - target.def
  return { kind: critical ? "critical" : "hit", damage: Math.max(1, Math.round(raw)) }
}

/** Up to this level a fall costs nothing: still finding your feet on the road. */
export const SAFE_LEVEL = 5

/** Experience lost on death: 1% of what the next level needs (none while new to the road, or at the cap). */
export function deathPenalty(level: number, needed: number): number {
  return level <= SAFE_LEVEL || needed === 0 ? 0 : Math.floor(needed / 100)
}

/**
 * A blow with an art (core/skills.ts): a strike hits `power` times as hard (or surely, as a
 * critical); a spell's attack comes from a stat instead of the weapon, never misses and meets
 * half the armour.
 */
export function artSwing(art: OffensiveEffect, stats: Stats, attacker: Fighter, target: Fighter, random: Random): Swing {
  if (art.kind === "spell") {
    const atk = art.magic.base + art.magic.per * stats[art.magic.stat]
    const raw = atk * (0.9 + random() * 0.2) - target.def / 2
    return { kind: "hit", damage: Math.max(1, Math.round(raw)) }
  }
  const strong = { ...attacker, atk: attacker.atk * art.power }
  return swing(art.sure ? { ...strong, crit: 100 } : strong, target, random)
}
