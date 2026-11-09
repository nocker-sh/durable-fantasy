import type { ShopQuote } from "#/world/core/shop-receipt-types"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"
import type { MarketRecord } from "#/world/server/market-record-types"

export type MarketContext = { state: MarketRecord; id: { toString(): string }; setAlarm(at: number): Promise<void> }

export type ShopPlayer = {
  read(): Promise<PlayerState>
  ownsConnection(connection: string): Promise<boolean>
  receiveShop(source: string, quote: ShopQuote): Promise<Transition>
}

export type ShopPlayers = (owner: string) => ShopPlayer

export const RETRY_MS = 5000

export const BATCH = 20
