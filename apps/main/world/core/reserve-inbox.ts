import type { ExchangeState } from "#/world/core/exchange-types"
import type { ExchangeClaims, InboxClaim } from "#/world/core/exchange-claim-types"
/** Reserve once; newly arriving goods go into a separate inbox while this claim is pending. */
export function reserveInbox(ex: ExchangeState, delivery: ExchangeClaims, owner: string): { ex: ExchangeState; delivery: ExchangeClaims; claim: InboxClaim } {
  const pending = delivery.claims[owner]
  if (pending) return { ex, delivery, claim: pending }
  if (!Number.isSafeInteger(delivery.claimSerial + 1)) throw new Error("Exchange claim IDs exhausted")
  const inbox = { ...ex.inbox }
  const claim = { id: delivery.claimSerial + 1, inbox: structuredClone(inbox[owner] ?? { gold: 0, items: [] }) }
  delete inbox[owner]
  return { ex: { ...ex, inbox }, delivery: { claimSerial: claim.id, claims: { ...delivery.claims, [owner]: claim } }, claim }
}
