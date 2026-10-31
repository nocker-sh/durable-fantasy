import { presence } from "#/world/server/map-room/presence"
import { sameTrade } from "#/world/server/map-room/same-trade"
import type { Ctx } from "#/world/server/map-room/context"

/** 所有者確認を待つ前の取引ではなく、現在の双方の取引で決定を受け付ける。 */
export function getTradeConfirmationParticipants(room: Ctx) {
  const me = presence(room.ctx.connection)
  if (!sameTrade(me.trade, room.me.trade)) return null
  const peer = me.trade?.open ? room.ctx.room.getConnection(me.trade.with) : undefined
  const other = peer && presence(peer)
  if (!me.owner || !me.trade || !peer || !other?.trade || !other.owner || me.owner === other.owner) return null
  if (other.trade.with !== room.ctx.connection.id || other.trade.session !== me.trade.session || me.trade.settling || other.trade.settling) return null

  return { peer, other, mine: me.trade, theirs: other.trade, ownerA: me.owner, ownerB: other.owner }
}
