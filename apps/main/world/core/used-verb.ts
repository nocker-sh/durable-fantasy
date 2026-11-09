import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"

/** How the log says it was used up: drinks are drunk, food is eaten, the rest is used. */
export function usedVerb(item: ItemId): "飲んだ" | "食べた" | "使った" {
  const definition = ITEMS[item]
  if (definition.drink) return "飲んだ"
  return definition.use?.full ? "食べた" : "使った"
}
