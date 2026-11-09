import { creditExchangeInbox } from "#/world/core/credit-exchange-inbox"
import { heldExchangeItem } from "#/world/core/held-exchange-item"
import type { ExchangeState, Order } from "#/world/core/exchange-types"
/** Return the order's remaining escrow to the caller-owned inbox working copy. */
export function giveBackOrder(working: ExchangeState, order: Order) {
  if (order.side === "buy") creditExchangeInbox({ inbox: working.inbox, owner: order.owner, gold: order.price * order.left })
  else creditExchangeInbox({ inbox: working.inbox, owner: order.owner, gold: 0, item: heldExchangeItem(order, order.left) })
}
