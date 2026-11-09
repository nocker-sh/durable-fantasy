import { apply } from "#/world/core/apply"
import { sameStacks } from "#/world/core/same-stacks"
import type { PlayerState } from "#/world/core/player-types"
import type { ClaimReception, InboxClaim } from "#/world/core/exchange-claim-types"
type Props = Readonly<{ player: PlayerState; previous: InboxClaim | null; claim: InboxClaim; now: number }>
/** Caller persists the receipt with the player; retries never add goods or gold twice. */
export function receiveInbox(props: Props): ClaimReception {
  const player = props.player,
    previous = props.previous,
    claim = props.claim,
    now = props.now
  if (!Number.isSafeInteger(claim.id) || claim.id <= 0 || !Number.isSafeInteger(claim.inbox.gold) || claim.inbox.gold < 0) return { ok: false, reason: "NOT_READY" }
  if (previous && claim.id <= previous.id) {
    if (claim.id !== previous.id || claim.inbox.gold !== previous.inbox.gold || !sameStacks(claim.inbox.items, previous.inbox.items)) return { ok: false, reason: "NOT_READY" }
    return { ok: true, state: player, events: [], receipt: previous }
  }
  const result = apply(player, { type: "receive", ...claim.inbox }, { now })
  return result.ok ? { ...result, receipt: structuredClone(claim) } : result
}
