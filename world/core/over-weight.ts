import { carried } from "#/world/core/inventory-weight"
import { derive } from "#/world/core/derive"
import type { PlayerState } from "#/world/core/player-types"

/** 持てる重さを超え、しかも前より重くなる変化か（game-system.md §4.4）。軽くなる変化や重さの変わらない変化は止めない。 */
export function overWeight(before: PlayerState, after: PlayerState): boolean {
  const load = carried(after)
  return load > derive(after).maxWeight && load > carried(before)
}
