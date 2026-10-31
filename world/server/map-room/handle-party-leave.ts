import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> }>

/** 脱退を保存先へ伝えてから接続の所属を外し、本人の保存状態と表示を更新する。 */
export async function handlePartyLeave(roomCtx: Props, _message: Message<"party-leave">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  if (!me.owner || !me.party) return
  await Party.get(me.party).leave(me.owner)
  roomCtx.save({ party: null })
  await ctx.connection.send({ type: "result", seq: -1, result: await Player.get(me.owner).run({ type: "set-party", party: null }) })
  await ctx.connection.send({ type: "party", view: null })
  return
}
