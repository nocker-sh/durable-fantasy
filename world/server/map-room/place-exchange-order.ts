import { sendExchangeBoard } from "#/world/server/map-room/send-exchange-board"
import type { ExchangeRequestContext } from "#/world/server/map-room/exchange-request-types"
import type { Message } from "#/world/server/map-room/context"

/** Reserve before placing, reply before reading the board, and never query it after a refused placement. */
export async function placeExchangeOrder(context: ExchangeRequestContext, message: Message<"ex-place">): Promise<void> {
  const begun = await context.exchange.beginOrder({
    owner: context.owner,
    connection: context.connection.id,
    seq: message.seq,
    name: context.name,
    intent: { side: message.side, symbol: message.symbol, price: message.price, qty: message.qty, market: message.market, slot: message.slot },
  })
  if (!begun.ok) {
    await context.connection.send({ type: "result", seq: message.seq, result: begun })
    return
  }
  const result = await context.exchange.place(context.owner, begun.id)
  await context.connection.send({ type: "result", seq: message.seq, result })
  if (result.ok) await sendExchangeBoard(context, message.symbol)
}
