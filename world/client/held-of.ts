import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { Item } from "#/world/scene/figure/look"
import type { ItemIcon } from "#/world/core/items/icons"
const HELD_BY_ICON: Partial<Record<ItemIcon, Item>> = {
  dagger: "sword",
  knife: "sword",
  machete: "sword",
  sword: "sword",
  longsword: "sword",
  greatsword: "greatsword",
  axe: "axe",
  spear: "spear",
  mace: "mace",
  flail: "mace",
  warhammer: "hammer",
  halberd: "halberd",
  estoc: "sword",
  falchion: "sword",
  bill: "halberd",
  pick: "hammer",
  staff: "staff",
}

export const heldOf = (id: ItemId): Item => {
  const d = ITEMS[id]
  if (d.equip?.part !== "weapon") return null
  if (d.icon === "axe" && d.equip.twoHanded) return "battleaxe"
  return HELD_BY_ICON[d.icon] ?? null
}
