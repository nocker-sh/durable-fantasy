import { Player } from "#/durable-objects/player"
import type { Ctx } from "#/world/server/map-room/context"
import { notifyClient } from "#/world/server/map-room/notifications"

type Props = Readonly<Pick<Ctx, "save"> & { me: Pick<Ctx["me"], "owner" | "sitting">; ctx: { connection: Pick<Ctx["ctx"]["connection"], "send"> } }>

/** 保存先が認めた姿勢を通知より先に反映し、移動と攻撃を進めてよいか返す。 */
export async function standUp(inputProps: Props): Promise<boolean> {
  const ctx = inputProps.ctx
  const me = inputProps.me
  const save = inputProps.save

  if (!me.sitting) return true
  if (!me.owner) return false
  const result = await Player.get(me.owner).run({ type: "stand" })
  if (result.ok) save({ sitting: result.state.sitting })
  await notifyClient(ctx.connection.send({ type: "result", seq: -1, result }))
  return result.ok
}
