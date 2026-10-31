import { Player } from "#/durable-objects/player"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "send"> }> }>

/** 回復を保存した後は状態通知が失敗しても、保存された帰還先への移動を通知する。 */
export async function handleRevive(room: Props, _message: Message<"revive">) {
  const me = room.me
  const connection = room.ctx.connection
  if (!me.player || !me.owner || !me.down) return
  const result = await Player.get(me.owner).reviveAtHome(connection.id)
  await notifyClient(connection.send({ type: "result", seq: -1, result }))
  if (!result.ok) return
  room.save({ down: false, sitting: false })
  const cell = result.state.savePoint.cell
  await connection.send({ type: "warped", map: result.state.savePoint.map, at: [cell[0], cell[1]] })
}
