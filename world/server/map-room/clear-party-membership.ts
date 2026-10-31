import { Player } from "#/durable-objects/player"
import type { Ctx } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> }>

/** 脱退済み・解散済みの所属を接続から外し、本人の保存状態を返してから表示を消す。 */
export async function clearPartyMembership(room: Props, owner: string): Promise<void> {
  room.save({ party: null })
  await room.ctx.connection.send({ type: "result", seq: -1, result: await Player.get(owner).run({ type: "set-party", party: null }) })
  await room.ctx.connection.send({ type: "party", view: null })
}
