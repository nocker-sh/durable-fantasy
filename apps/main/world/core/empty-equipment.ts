import type { ItemId } from "#/world/core/items/catalog"
import type { Slot } from "#/world/core/items/kinds"

/** 全ての装備枠が空いた、新しい記録を返す。 */
export function emptyEquipment(): Record<Slot, ItemId | null> {
  return { head: null, neck: null, body: null, weapon: null, shield: null, feet: null, accessory1: null, accessory2: null }
}
