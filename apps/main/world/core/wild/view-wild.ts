import { spawnsOn } from "#/world/core/spawns-on"
import { fightOf } from "#/world/core/wild/fight-of"
import { CLAIM_MS, MONSTER_KINDS } from "#/world/core/monsters"
import { hpOf } from "#/world/core/wild/hp-of"
import type { CreatureHealth, WildState } from "#/world/core/wild/types"

/** Read one map's health and return times from the same authoritative state and timestamp. */
export function viewWild(state: WildState, map: string, now: number): Record<string, CreatureHealth> {
  return Object.fromEntries(
    spawnsOn(map).map((spawn) => {
      const fight = fightOf(state, spawn.id, now)
      const combat = fight && MONSTER_KINDS[spawn.kind].atk > 0 ? { at: fight.started ?? fight.at, until: fight.at + CLAIM_MS } : undefined
      return [spawn.id, { hp: hpOf(state, spawn.id, now), back: state.back[spawn.id] ?? 0, ...(combat ? { combat } : {}) }]
    }),
  )
}
