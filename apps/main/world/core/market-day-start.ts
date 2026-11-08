import { MARKET_DAY_MS, MARKET_JST_OFFSET_MS } from "#/world/core/market-rules"

/** Shelf production and discard times use the same Japan-time day boundary. */
export function marketDayStart(time: number): number {
  return Math.floor((time + MARKET_JST_OFFSET_MS) / MARKET_DAY_MS) * MARKET_DAY_MS - MARKET_JST_OFFSET_MS
}
