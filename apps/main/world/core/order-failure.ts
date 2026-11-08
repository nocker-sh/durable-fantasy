import { parseSymbol } from "#/world/core/parse-symbol"
import { MAX_ORDER_PRICE, MAX_ORDER_QTY } from "#/world/core/exchange-rules"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { Reason } from "#/world/core/commands"
export function orderFailure(intent: OrderIntent): Reason | null {
  if (!parseSymbol(intent.symbol)) return "NOT_SELLABLE"
  if (!Number.isSafeInteger(intent.price) || intent.price < 1 || intent.price > MAX_ORDER_PRICE || !Number.isSafeInteger(intent.qty) || intent.qty < 1 || intent.qty > MAX_ORDER_QTY) return "NOT_READY"
  return null
}
