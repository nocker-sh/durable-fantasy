import type { PlayerState } from "#/world/core/player-types"

/** The gold a player may hand to another player: what they hold less the starting gold not yet spent in town. */
export function handableGold(state: Pick<PlayerState, "gold" | "allowance">): number {
  return state.gold - Math.min(state.gold, state.allowance ?? 0)
}
