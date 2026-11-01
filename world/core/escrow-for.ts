import { LISTING_FEE } from "#/world/core/exchange-rules"

/** The listing fee rounds up with a minimum of 1G per order (against flooding the board); only buy orders reserve the purchase amount as well. */
export function escrowFor(side: "buy" | "sell", price: number, qty: number): { gold: number; fee: number } {
  const value = price * qty
  const fee = Math.max(1, Math.ceil(value * LISTING_FEE))
  return { gold: side === "buy" ? value + fee : fee, fee }
}
