import type { ItemId } from "#/world/core/items/catalog"

/** A batch: when it comes out (minutes past midnight, Japan time) and how many. */
export type Batch = {
  at: readonly number[]
  count: number
  /** residents who buy some, minutes after it comes out */ eaten?: { after: number; count: number }
}

/** Stock by shop and item: how many of each quality are on the shelf. */
export type Shelf = Record<string, Partial<Record<ItemId, [number, number, number, number]>>>

export type MarketState = {
  shelf: Shelf
  /** time (ms) the shelves were last brought up to date */
  at: number
  /** when this market opened */
  since?: number
  /** everything else the shops keep, by shop and item: how many are in stock (economy.md §4.1) */
  stock?: Record<string, Partial<Record<ItemId, number>>>
}

/** Every batch and every resident's purchase between two times, in order. */
export type Happening = { t: number; shop: string; item: ItemId } & ({ kind: "production"; count: number; first: boolean } | { kind: "consumption"; count: number })

export type Taken = { ok: true; state: MarketState; price: number } | { ok: false; reason: "SOLD_OUT" | "PRICE_CHANGED" }
