import type { SHOPS } from "#/world/core/shops"
import type { ItemId } from "#/world/core/items/catalog"
import type { ItemKind } from "#/world/core/items/kinds"

export type ShopKind = "food" | "inn" | "weapon" | "armor" | "tools" | "medicine" | "crystal" | "tailor" | "buyer"

export type ShopDefinition = {
  name: string
  kind: ShopKind
  /** the map the shop stands on (world/maps) */
  map: string
  /** Resident names that open this shop when spoken to. */
  keepers: readonly string[]
  /** Line said when the shop window opens. */
  greeting: string
  /** the opening line in a keeper's own voice where it differs from `greeting`; each keeper speaks as themselves */
  greetings?: Readonly<Record<string, string>>
  stock: readonly ItemId[]
  /** whose made things these are (game-system.md §4.2.1); the usual maker when not named */
  makers?: Partial<Record<ItemId, string>>
  /** what it buys from you besides its own stock (core/shop-takes.ts; the buyer takes everything) */
  takes?: readonly ItemId[]
  /** pays this many times the base price for these kinds, capped at MAX_SHOP_RATE (core/shop-rate.ts) */
  rates?: Partial<Record<ItemKind, number>>
  /** a street seller's pitch: open only while the seller stands there (town/routines.ts) */
  at?: { map: string; place: string }
}

export type ShopId = keyof typeof SHOPS
