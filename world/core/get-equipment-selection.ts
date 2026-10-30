import { ITEMS } from "#/world/core/items/catalog"
import { slotsFor } from "#/world/core/items/slots-for"
import { unmet } from "#/world/core/unmet"
import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"
import type { SelectedEquipment } from "#/world/core/equipment-types"

/** 能力条件は装飾品の補正を足す前の能力値で確かめる。 */
export function getEquipmentSelection(state: PlayerState, index: number, to?: Slot): SelectedEquipment {
  const stack = state.bag[index]
  if (!stack) return { ok: false, reason: "EMPTY_SLOT" }
  const equipment = ITEMS[stack.item].equip,
    slots = slotsFor(stack.item)
  if (!equipment || !slots.length || (to && !slots.includes(to))) return { ok: false, reason: "NOT_EQUIPPABLE" }
  const short = unmet(equipment.needs, state)
  if (short.length) return { ok: false, reason: short.some((need) => need[0] in state.stats) ? "STAT_TOO_LOW" : "SKILL_TOO_LOW" }
  const slot = to ?? slots.find((candidate) => !state.equipment[candidate]) ?? slots[0]
  const weapon = state.equipment.weapon
  if (slot === "shield" && weapon && ITEMS[weapon].equip?.twoHanded) return { ok: false, reason: "TWO_HANDED" }

  return { ok: true, selection: { slot, stack, twoHanded: Boolean(equipment.twoHanded) } }
}
