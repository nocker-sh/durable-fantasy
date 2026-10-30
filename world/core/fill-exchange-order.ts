import { TRADE_FEE } from "#/world/core/exchange-rules"
import { creditExchangeInbox } from "#/world/core/credit-exchange-inbox"
import { heldExchangeItem } from "#/world/core/held-exchange-item"
import { recordExchangeFill } from "#/world/core/record-exchange-fill"
import type { ExchangePlacement, Order, Fill } from "#/world/core/exchange-types"

/** The standing order sets the price; a market buyer may consume only what its remaining budget pays for. */
export function fillExchangeOrder(placement: ExchangePlacement, other: Order): boolean {
  const price = other.price
  const qty = Math.min(placement.order.left, other.left, placement.offer.side === "buy" && placement.offer.market ? Math.floor(placement.budget / price) : Infinity)
  if (qty === 0) return false
  if (placement.offer.side === "buy") placement.budget -= price * qty
  const buyer = placement.offer.side === "buy" ? placement.order : other
  const seller = placement.offer.side === "buy" ? other : placement.order
  const fee = Math.ceil(price * qty * TRADE_FEE)
  placement.state.fees += fee
  creditExchangeInbox({ inbox: placement.state.inbox, owner: seller.owner, gold: price * qty - fee })
  creditExchangeInbox({ inbox: placement.state.inbox, owner: buyer.owner, gold: 0, item: heldExchangeItem(seller, qty) })
  placement.order.left -= qty
  other.left -= qty
  const fill: Fill = { symbol: placement.offer.symbol, price, qty, buyer: buyer.owner, seller: seller.owner, at: placement.now }
  placement.fills.push(fill)
  recordExchangeFill(placement.state.history, fill)
  return true
}
