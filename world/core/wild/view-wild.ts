import { spawnsOn } from "#/world/core/spawns-on"
import { hpOf } from "#/world/core/wild/hp-of"
import type { CreatureHealth, WildState } from "#/world/core/wild/types"

/** Read one map's health and return times from the same authoritative state and timestamp. */
export function viewWild(state: WildState, map: string, now: number): Record<string, CreatureHealth> {
  return Object.fromEntries(spawnsOn(map).map((spawn) => [spawn.id, { hp: hpOf(state, spawn.id, now), back: state.back[spawn.id] ?? 0 }]))
}
