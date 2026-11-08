import type { ExchangeRequestContext } from "#/world/server/map-room/exchange-request-types"

/** Board reads follow a successful placement result; transport failures remain visible to the caller. */
export async function sendExchangeBoard(context: ExchangeRequestContext, symbol: string): Promise<void> {
  await context.connection.send({ type: "exchange", symbol, view: await context.exchange.look(symbol, context.owner) })
}
