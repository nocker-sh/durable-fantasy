import { Player } from "#/durable-objects/player"
import { isOpen } from "#/world/maps/is-open"
import { atWarp } from "#/world/server/map-room/at-warp"
import { travelStamina } from "#/world/server/map-room/travel-stamina"
import type { Ctx, Message } from "#/world/server/map-room/context"
import type { Cell } from "#/world/protocol"

type Props = Readonly<Pick<Ctx, "me"> & { map: Pick<Ctx["map"], "warps">; ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "send"> }> }>

/** 行先の開通（game-system.md §1）を確かめ、疲労と移動を保存先で一緒に確定した後だけ画面の移動を通知する。 */
export async function handleWarp(room: Props, message: Message<"warp">) {
  const me = room.me
  const warp = room.map.warps[message.warp]
  const connection = room.ctx.connection
  if (!me.player || me.engaged || me.trade?.open || !warp || !atWarp(me, warp.at)) return connection.send({ type: "refused", what: "warp" })
  if (!isOpen(warp.to.map)) return connection.send({ type: "refused", what: "warp", reason: "ROAD_CLOSED" })
  if (!me.owner) return
  const at: Cell = [warp.to.at[0], warp.to.at[1]]
  const journey = await Player.get(me.owner).journey({ connection: connection.id, map: warp.to.map, at, tire: travelStamina(warp.to.map) })
  if (!journey.ok) {
    if (journey.reason) await connection.send({ type: "refused", what: "warp", reason: journey.reason })
    return
  }
  await connection.send({ type: "warped", map: warp.to.map, at })
}
