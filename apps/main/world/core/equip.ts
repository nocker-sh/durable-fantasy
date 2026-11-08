import { getEquipmentSelection } from "#/world/core/get-equipment-selection"
import { getEquipmentDisplacements } from "#/world/core/get-equipment-displacements"
import { getReturnedEquipment } from "#/world/core/get-returned-equipment"
import { wornOf } from "#/world/core/worn-of"
import { takeFromSlot } from "#/world/core/take-from-slot"
import { settleStats } from "#/world/core/settle-stats"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"

/** 条件と持ち替え後の収納を確認してから、装備と能力値を一緒に確定する。 */
export function equip(state: PlayerState, index: number, to?: Slot): Transition {
  const selected = getEquipmentSelection(state, index, to)
  if (!selected.ok) return reject(selected.reason)
  const selection = selected.selection,
    bag = takeFromSlot(state.bag, index, 1)
  if (!bag) return reject("EMPTY_SLOT")
  const displaced = getEquipmentDisplacements(state, selection)
  const returned = getReturnedEquipment({ state, bag, worn: { ...state.worn, [selection.slot]: wornOf(selection.stack) }, slots: displaced.slots, selectedSlot: selection.slot })
  if (!returned.ok) return reject(returned.reason)

  return settleStats({ ...state, bag: returned.bag, equipment: displaced.equipment, worn: returned.worn }, ...returned.events, { type: "equipped", item: selection.stack.item, slot: selection.slot })
}
