import type { Command, Reason } from "#/world/core/commands"
import type { Stack } from "#/world/core/bag-types"

export type ShopCommand = Extract<Command, { type: "buy" | "sell" }>
export type ShopQuote = { id: number; unitPrice: number; keepers: string[] } & (Extract<ShopCommand, { type: "buy" }> | (Extract<ShopCommand, { type: "sell" }> & { stack: Stack }))
export type ShopReceipt = {
  quote: ShopQuote
  outcome: { ok: true } | { ok: false; reason: Reason }
}
