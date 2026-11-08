import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { Slot } from "#/world/core/items/kinds"
export function slotsFor(id: ItemId): readonly Slot[] {
  const part = ITEMS[id].equip?.part
  if (!part) return []
  return part === "accessory" ? ["accessory1", "accessory2"] : [part]
}
