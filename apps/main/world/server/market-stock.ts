import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

/** One line in a shop's window: a thing, its quality, what it costs now and how many are left (null: plenty). */
export type Offer = {
  item: ItemId
  q: Quality
  price: number
  left: number | null
  next: number | null
}
