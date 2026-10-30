import { restoreMarket } from "#/world/server/restore-market"
import type { MarketRecord } from "#/world/server/market-record-types"

/** Add the reservation envelope only after the old market has passed validation. */
export function migrateMarketRecord(saved: unknown): MarketRecord {
  if (!saved || typeof saved !== "object" || !("market" in saved)) throw new Error("Saved market record is unreadable")

  return { ...saved, market: restoreMarket(saved.market), serial: 0, jobs: {} }
}
