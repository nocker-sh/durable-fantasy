import { Player } from "#/durable-objects/player"
import { getTradeOfferPresentation } from "#/world/core/get-trade-offer-presentation"
import { getCurrentTradeOffer } from "#/world/server/map-room/get-current-trade-offer"
import { presence } from "#/world/server/map-room/presence"
import { setTrade } from "#/world/server/map-room/set-trade"
import { showTrade } from "#/world/server/map-room/show-trade"
import type { Ctx, Message } from "#/world/server/map-room/context"

/** 読取り前に提示の版を進め、読取り後にも同じ取引の最新の提示かを確かめる。 */
export async function handleTradeOffer(room: Ctx, message: Message<"trade-offer">) {
  const me = room.me
  const connection = room.ctx.connection
  const them = me.trade?.open ? room.ctx.room.getConnection(me.trade.with) : undefined
  if (!me.owner || !me.trade || !them || me.trade.locked || me.trade.settling) return
  const current = presence(connection).trade
  if (!current?.open || current.session !== me.trade.session || current.with !== them.id || current.locked || current.settling) return
  const version = (current.offerVersion ?? 0) + 1
  room.save({ trade: { ...current, offerVersion: version } })
  const inventory = await Player.get(me.owner).read()
  const participants = getCurrentTradeOffer({ sender: { id: connection.id, presence: presence(connection) }, recipient: { id: them.id, presence: presence(them) }, session: current.session, version })
  if (!participants) return
  const presentation = getTradeOfferPresentation(inventory, message)
  if (!presentation) return
  room.save({ trade: { ...participants.mine, offer: presentation.offer, shown: presentation.shown, locked: false, done: false } })
  setTrade(them, { ...participants.other, locked: false, done: false })
  await showTrade(connection, them)
}
