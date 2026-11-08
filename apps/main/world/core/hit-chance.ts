import type { Fighter } from "#/world/core/combat-types"

/** Chance to hit in percent, kept between 5 and 95. */
export function hitChance(attacker: Pick<Fighter, "hit">, target: Pick<Fighter, "flee">): number {
  return Math.min(95, Math.max(5, 80 + attacker.hit - target.flee))
}
