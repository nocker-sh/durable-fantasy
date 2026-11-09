import { expire } from "#/world/core/expire"
import { reserveInbox } from "#/world/core/reserve-inbox"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { ExchangeContext } from "#/world/server/exchange-coordinator"

export async function reserveExchangeInbox(context: ExchangeContext, owner: string): Promise<InboxClaim> {
  context.state.ex = expire(context.state.ex, Date.now())
  const reserved = reserveInbox(context.state.ex, context.state.delivery, owner)
  Object.assign(context.state, { ex: reserved.ex, delivery: reserved.delivery })
  await context.setAlarm(Date.now() + 100)
  return reserved.claim
}
