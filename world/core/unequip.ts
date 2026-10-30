import { putStack } from "#/world/core/put-stack"
import { withoutWornSlot } from "#/world/core/without-worn-slot"
import { settleStats } from "#/world/core/settle-stats"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"

/** 袋へ戻せる場合だけ装備の枠と印を外す。 */
export function unequip(state: PlayerState, slot: Slot): Transition {
  const item = state.equipment[slot]
  if (!item) return reject("NOTHING_EQUIPPED")
  const bag = putStack(state.bag, { item, count: 1, ...state.worn[slot] })
  if (!bag) return reject("BAG_FULL")
  return settleStats({ ...state, bag, equipment: { ...state.equipment, [slot]: null }, worn: withoutWornSlot(state.worn, slot) }, { type: "unequipped", item, slot })
}
