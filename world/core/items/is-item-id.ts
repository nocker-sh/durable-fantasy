import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
export function isItemId(value: string): value is ItemId {
  return Object.hasOwn(ITEMS, value)
}
