import { derive } from "#/world/core/derive"
import type { CombatAudience, CombatReader } from "#/world/server/combat-plan"

/** Recover the hunter's snapshot for saved requests that predate room audiences. */
export async function readCombatAudience(players: (owner: string) => CombatReader, owner: string): Promise<CombatAudience> {
  const combat = await players(owner).readCombat()
  const player = combat.player
  const defense = derive(player)
  return { party: null, near: [], level: player.level, life: combat.life, defense: { atk: defense.atk, def: defense.def, hit: defense.hit, flee: defense.flee, crit: defense.crit } }
}
