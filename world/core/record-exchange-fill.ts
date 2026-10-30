import { getExchangeDay } from "#/world/core/get-exchange-day"
import { EXCHANGE_HISTORY_DAYS } from "#/world/core/exchange-rules"
import type { Candle, Fill } from "#/world/core/exchange-types"
/** Update only the matching operation's cloned history; retain the original single-day trimming behavior. */
export function recordExchangeFill(history: Record<string, Candle[]>, fill: Fill) {
  const days = (history[fill.symbol] ??= [])
  const day = getExchangeDay(fill.at)
  const last = days.at(-1)
  if (last?.day === day) {
    last.high = Math.max(last.high, fill.price)
    last.low = Math.min(last.low, fill.price)
    last.close = fill.price
    last.volume += fill.qty
  } else days.push({ day, open: fill.price, high: fill.price, low: fill.price, close: fill.price, volume: fill.qty })
  if (days.length > EXCHANGE_HISTORY_DAYS) days.shift()
}
