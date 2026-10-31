import { Player } from "#/durable-objects/player"
import { Market } from "#/durable-objects/market"
import { SHOPS } from "#/world/core/shops"
import { isShopId } from "#/world/core/is-shop-id"
import { getCarriedSellableItemIds } from "#/world/core/get-carried-sellable-item-ids"
import { TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import { minutesToClose } from "#/world/maps/minutes-to-close"
import { TOWN } from "#/world/server/map-room/presence"
import { timeFor } from "#/world/server/map-room/time-for"
import { near } from "#/world/server/map-room/near"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me"> & { map: Pick<Ctx["map"], "id">; ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> }>

/** 実際に店番をしている人へ届く場合だけ、品揃えと本人の持ち物の買取価格を読む。 */
export async function handleShopLook(room: Props, message: Message<"look">) {
  const me = room.me
  if (!me.player || !isShopId(message.shop)) return
  const shop = message.shop
  const keepers = SHOPS[shop].keepers.map((name) => npcCell(room.map, name, timeFor(me))).filter((cell) => cell !== null)
  if (!keepers.some((cell) => near(me, cell, TALK_CELLS + 1))) return
  const offers = await Market.get(TOWN).look(shop, minutesToClose(shop, timeFor(me)))
  const carried = me.owner ? getCarriedSellableItemIds((await Player.get(me.owner).read()).bag) : []
  await room.ctx.connection.send({ type: "stock", shop, offers, buys: await Market.get(TOWN).buying(shop, carried) })
}
