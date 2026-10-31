import type { ExchangeRequestContext } from "#/world/server/map-room/exchange-request-types"
import type { Message } from "#/world/server/map-room/context"

/** Keep the saved inbox reservation as the identity of delivery before acknowledging its result. */
export async function claimExchangeInbox(context: ExchangeRequestContext, message: Message<"ex-claim">): Promise<void> {
  const claim = await context.exchange.reserveInbox(context.owner)
  const result = await context.exchange.deliverInbox(context.owner, claim.id)
  await context.connection.send({ type: "result", seq: message.seq, result })
}
