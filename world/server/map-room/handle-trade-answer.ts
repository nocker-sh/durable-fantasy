import { emptyOffer } from "#/world/core/empty-offer"
import { presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"
import { setTrade } from "#/world/server/map-room/set-trade"
import { showTrade } from "#/world/server/map-room/show-trade"
import { getTradeAnswerRejection } from "#/world/server/map-room/get-trade-answer-rejection"
import { rejectTradeInvitation } from "#/world/server/map-room/reject-trade-invitation"
import type { Ctx, Message } from "#/world/server/map-room/context"
import type { TradeSide } from "#/world/server/map-room/presence"

/** 返答時の検査後に共有の取引識別子を作り、双方を現在の位置で停止する。 */
export async function handleTradeAnswer(roomCtx: Ctx, message: Message<"trade-answer">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  const them = ctx.room.getConnection(message.from)
  const other = them && presence(them)
  if (!me.player || !them || other?.trade?.with !== ctx.connection.id || other.trade.open) return
  const reason = getTradeAnswerRejection({ recipient: me, asker: other, accepted: message.yes })
  if (reason) return rejectTradeInvitation({ room: roomCtx, asker: them, message, reason })
  const session = crypto.randomUUID()
  const side = (w: string): TradeSide => ({ session, with: w, open: true, offer: emptyOffer(), shown: [], locked: false, done: false })
  // standing to trade: both stop where they are
  roomCtx.save({ trade: side(them.id), route: [reachable(me).at(-1)!], since: Date.now() })
  setTrade(them, side(ctx.connection.id), { route: [reachable(other).at(-1)!], since: Date.now() })
  await showTrade(ctx.connection, them)
  return
}
