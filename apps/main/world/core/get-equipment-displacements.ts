import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"
import type { EquipmentSelection } from "#/world/core/equipment-types"

/** 両手の武器へ替えるときは盾も外し、外した順序をイベントにも使う。 */
export function getEquipmentDisplacements(state: PlayerState, selection: EquipmentSelection) {
  const equipment = { ...state.equipment, [selection.slot]: selection.stack.item }
  const slots: Slot[] = []
  if (state.equipment[selection.slot]) slots.push(selection.slot)
  if (selection.slot === "weapon" && selection.twoHanded && state.equipment.shield) {
    slots.push("shield")
    equipment.shield = null
  }
  return { equipment, slots }
}
