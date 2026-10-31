import type { ExchangeRequestContext } from "#/world/server/map-room/exchange-request-types"
import type { Message } from "#/world/server/map-room/context"

/** Only read the confirmed player state after the exchange accepts the cancellation. */
export async function cancelExchangeOrder(context: ExchangeRequestContext, message: Message<"ex-cancel">): Promise<void> {
  if (!(await context.exchange.cancel(context.owner, message.id))) {
    await context.connection.send({ type: "result", seq: message.seq, result: { ok: false, reason: "NOT_READY" } })
    return
  }
  await context.connection.send({ type: "result", seq: message.seq, result: { ok: true, state: await context.player.read(), events: [] } })
}
