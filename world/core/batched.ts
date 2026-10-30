import { BATCHES } from "#/world/core/market-batches"
import type { ItemId } from "#/world/core/items/catalog"
export function batched(shop: string, item: ItemId) {
  return !!BATCHES[shop]?.[item]
}
