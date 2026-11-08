import { presence } from "#/world/server/map-room/presence"
import { setTrade } from "#/world/server/map-room/set-trade"
import { showTrade } from "#/world/server/map-room/show-trade"
import { getTradeAnswer } from "#/world/server/map-room/get-trade-answer"
import { createOpenTradeSide } from "#/world/server/map-room/create-open-trade-side"
import { rejectTradeInvitation } from "#/world/server/map-room/reject-trade-invitation"
import type { Message } from "#/world/server/map-room/context"
import type { TradeAnswerContext } from "#/world/server/map-room/trade-answer-types"

/** 返答時に確認した地点で双方を止め、同じ識別子で取引を開始する。 */
export async function handleTradeAnswer(room: TradeAnswerContext, message: Message<"trade-answer">) {
  const ctx = room.ctx
  const me = room.me
  const them = ctx.room.getConnection(message.from)
  const other = them && presence(them)
  if (!me.player || !them || other?.trade?.with !== ctx.connection.id || other.trade.open) return
  const now = Date.now()
  const decision = getTradeAnswer({ recipient: me, asker: other, accepted: message.yes, now })
  if (!decision.ok) return rejectTradeInvitation({ room, asker: them, message, reason: decision.reason })
  const session = crypto.randomUUID()
  room.save({ trade: createOpenTradeSide(them.id, session), route: [decision.recipientAt], since: now })
  setTrade(them, createOpenTradeSide(ctx.connection.id, session), { route: [decision.askerAt], since: now })
  await showTrade(ctx.connection, them)
}
