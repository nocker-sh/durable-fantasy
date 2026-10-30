import { escrowFor } from "#/world/core/escrow-for"
import { orderFailure } from "#/world/core/order-failure"
import { parseSymbol } from "#/world/core/parse-symbol"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { Reason, ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
type EscrowSelection = { command: Extract<ServerCommand, { type: "escrow-buy" | "escrow-sell" }>; by?: string }

/** Validate the fresh request before choosing a debit; selling must retain the selected item's exact quality and maker. */
export function getOrderEscrowCommand(player: Pick<PlayerState, "bag">, intent: OrderIntent): EscrowSelection | { reason: Reason } {
  const reason = orderFailure(intent)
  if (reason) return { reason }
  const symbol = parseSymbol(intent.symbol)
  if (!symbol) return { reason: "NOT_SELLABLE" }
  if (intent.side === "sell") {
    if (intent.slot === undefined) return { reason: "EMPTY_SLOT" }
    const slot = player.bag[intent.slot]
    if (!slot || slot.item !== symbol.item || slot.q !== symbol.q) return { reason: "EMPTY_SLOT" }
    const escrow = escrowFor(intent.side, intent.price, intent.qty)
    return { command: { type: "escrow-sell", slot: intent.slot, qty: intent.qty, fee: escrow.fee }, ...(slot.by !== undefined ? { by: slot.by } : {}) }
  }
  const escrow = escrowFor(intent.side, intent.price, intent.qty)
  return { command: { type: "escrow-buy", gold: escrow.gold } }
}
