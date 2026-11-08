import { hitChance } from "#/world/core/hit-chance"
import type { Fighter, Random, Swing } from "#/world/core/combat-types"

/** One swing: a critical ignores evasion and hits 1.4 times as hard; otherwise roll to hit. */
export function swing(attacker: Fighter, target: Fighter, random: Random): Swing {
  const critical = random() * 100 < attacker.crit
  if (!critical && random() * 100 >= hitChance(attacker, target)) return { kind: "miss" }
  const roll = 0.9 + random() * 0.2
  const raw = attacker.atk * roll * (critical ? 1.4 : 1) - target.def
  return { kind: critical ? "critical" : "hit", damage: Math.max(1, Math.round(raw)) }
}
