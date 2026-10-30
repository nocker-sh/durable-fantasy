import type { ItemId } from "#/world/core/items/catalog"
import type { Quality } from "#/world/core/items/kinds"

/** What is traded: an item, and for made things its quality (makers are not separate symbols). */
export type Symbol = {
  item: ItemId
  q?: Quality
}

export type OrderIntent = {
  side: "buy" | "sell"
  symbol: string
  price: number
  qty: number
  market?: boolean
  slot?: number
}

export type Order = {
  id: string
  owner: string
  /** the name shown in the list (and a seller's maker, for made things) */
  name: string
  side: "buy" | "sell"
  symbol: string
  /** gold per one */
  price: number
  left: number
  at: number
  expires: number
  /** a sell order of a made thing: whose make it is */
  by?: string
}

/** What waits for a player at the board: gold, and things (with their maker for made things). */
export type Inbox = {
  gold: number
  items: { item: ItemId; count: number; q?: Quality; by?: string }[]
}

export type Fill = {
  symbol: string
  price: number
  qty: number
  buyer: string
  seller: string
  at: number
}

export type Candle = {
  day: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type ExchangeState = {
  orders: Order[]
  inbox: Record<string, Inbox>
  /** fees taken, all told (money gone from the economy) */
  fees: number
  /** daily prices by symbol */
  history: Record<string, Candle[]>
  seq: number
}

export type Placed = {
  state: ExchangeState
  order: Order | null
  fills: Fill[]
}

export type ExchangeOffer = {
  owner: string
  name: string
  side: "buy" | "sell"
  symbol: string
  price: number
  qty: number
  market?: boolean
  by?: string
}

/** Owned working state for one placement; only this copy and its matching orders may be changed. */
export type ExchangePlacement = {
  state: ExchangeState
  offer: ExchangeOffer
  order: Order
  now: number
  fills: Fill[]
  budget: number
}
