import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnOf } from "#/world/core/spawn-of"
import { about } from "#/world/core/wild/about"
import { fighting } from "#/world/core/wild/fighting"
import type { WildState } from "#/world/core/wild/types"

/** Unclaimed creatures recover their full health; an absent or recovering spawn has none. */
export function hpOf(state: WildState, id: string, now: number): number {
  const spawn = spawnOf(id)
  if (!spawn) return 0
  if (!about(state, id, now)) return 0
  if (!fighting(state, id, now)) return MONSTER_KINDS[spawn.kind].hp

  return state.hp[id] ?? MONSTER_KINDS[spawn.kind].hp
}
