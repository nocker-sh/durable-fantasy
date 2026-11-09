import { Player } from "#/durable-objects/player"
import { Exchange } from "#/durable-objects/exchange"
import { parseSymbol } from "#/world/core/parse-symbol"
import { BOARD_REACH, EXCHANGE_BOARD } from "#/world/town/boards"
import { near } from "#/world/server/map-room/near"
import { sendExchangeBoard } from "#/world/server/map-room/send-exchange-board"
import { placeExchangeOrder } from "#/world/server/map-room/place-exchange-order"
import { cancelExchangeOrder } from "#/world/server/map-room/cancel-exchange-order"
import { claimExchangeInbox } from "#/world/server/map-room/claim-exchange-inbox"
import type { Transition } from "#/world/core/transition"
import type { Ctx, Message } from "#/world/server/map-room/context"
import type { ExchangeRequestContext } from "#/world/server/map-room/exchange-request-types"

type Props = Readonly<{ me: Ctx["me"]; key: Pick<Ctx["key"], "map">; ctx: Readonly<{ connection: ExchangeRequestContext["connection"] }> }>

/** Validate board access and symbols before obtaining any persistent-state stub. */
export async function handleExchangeRequest(room: Props, message: Message<"ex-look" | "ex-place" | "ex-cancel" | "ex-claim">): Promise<void> {
  const me = room.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ("seq" in message ? room.ctx.connection.send({ type: "result", seq: message.seq, result }) : undefined)
  if (room.key.map !== EXCHANGE_BOARD.map || !near(me, EXCHANGE_BOARD.cell, BOARD_REACH)) return answer({ ok: false, reason: "TOO_FAR" })
  if ((message.type === "ex-look" || message.type === "ex-place") && !parseSymbol(message.symbol)) return answer({ ok: false, reason: "NOT_SELLABLE" })
  const exchange = Exchange.get("world")
  const player = Player.get(me.owner)
  const context: ExchangeRequestContext = { connection: room.ctx.connection, owner: me.owner, name: me.player.name, exchange, player }
  if (message.type === "ex-look") return sendExchangeBoard(context, message.symbol)
  if (message.type === "ex-place") return placeExchangeOrder(context, message)
  if (message.type === "ex-cancel") return cancelExchangeOrder(context, message)
  return claimExchangeInbox(context, message)
}
