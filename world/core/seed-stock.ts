import { batched } from "#/world/core/batched"
import { target } from "#/world/core/target"
import type { ItemId } from "#/world/core/items/catalog"
import type { MarketState } from "#/world/core/market-types"
export function seedStock(shops: Record<string, { stock: readonly ItemId[] }>): NonNullable<MarketState["stock"]> {
  const stock: NonNullable<MarketState["stock"]> = {}
  for (const entry of Object.entries(shops)) for (const item of entry[1].stock) if (!batched(entry[0], item)) (stock[entry[0]] ??= {})[item] = target(item)
  return stock
}
