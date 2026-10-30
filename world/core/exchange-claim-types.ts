import type { Inbox } from "#/world/core/exchange-types"
import type { Transition } from "#/world/core/transition"
export type InboxClaim = {
  id: number
  inbox: Inbox
}
export type ExchangeClaims = {
  claimSerial: number
  claims: Record<string, InboxClaim>
}
export type ClaimReception = Extract<Transition, { ok: false }> | (Extract<Transition, { ok: true }> & { receipt: InboxClaim })
