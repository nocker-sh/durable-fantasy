import { emptyMarket } from "#/world/core/empty-market"
import type { MarketRecord } from "#/world/server/market-record-types"

/** Only an unsaved market starts with a new timestamp and no outstanding reservations. */
export function initialMarketRecord(): MarketRecord {
  return { market: emptyMarket(Date.now()), serial: 0, jobs: {} }
}
