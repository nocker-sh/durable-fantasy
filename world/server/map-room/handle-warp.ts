import { Player } from "#/durable-objects/player"
import { isOpen } from "#/world/maps/is-open"
import { atWarp } from "#/world/server/map-room/at-warp"
import { tireForTravel } from "#/world/server/map-room/tire-for-travel"
import type { Ctx, Message } from "#/world/server/map-room/context"
import type { Cell } from "#/world/protocol"

type Props = Readonly<Pick<Ctx, "me"> & { map: Pick<Ctx["map"], "warps">; ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "send"> }> }>

/** 行先の開通（game-system.md §1）と疲労を先に確認し、保存先が移動を受け付けた後だけ画面の移動を通知する。 */
export async function handleWarp(room: Props, message: Message<"warp">) {
  const me = room.me
  const warp = room.map.warps[message.warp]
  const connection = room.ctx.connection
  if (!me.player || me.engaged || me.trade?.open || !warp || !atWarp(me, warp.at)) return connection.send({ type: "refused", what: "warp" })
  if (!isOpen(warp.to.map)) return connection.send({ type: "refused", what: "warp", reason: "ROAD_CLOSED" })
  const reason = await tireForTravel(me.owner, warp.to.map)
  if (reason) return connection.send({ type: "refused", what: "warp", reason })
  const at: Cell = [warp.to.at[0], warp.to.at[1]]
  if (!me.owner || !(await Player.get(me.owner).travel({ connection: connection.id, map: warp.to.map, at }))) return
  await connection.send({ type: "warped", map: warp.to.map, at })
}
