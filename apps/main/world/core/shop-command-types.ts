import type { Quality } from "#/world/core/items/kinds"

/** Server-confirmed unit price and the keepers currently on duty. */
export type ShopContext = { price?: number; keepers?: readonly string[] }
export type ShopPurchase = { q: Quality; by: string | undefined; cost: number }
