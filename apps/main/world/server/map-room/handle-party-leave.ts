import { Party } from "#/durable-objects/party"
import { clearPartyMembership } from "#/world/server/map-room/clear-party-membership"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "send"> }> }>

/** 脱退を保存先へ伝えてから接続の所属を外し、本人の保存状態と表示を更新する。 */
export async function handlePartyLeave(roomCtx: Props, _message: Message<"party-leave">) {
  const me = roomCtx.me
  if (!me.owner || !me.party) return
  await Party.get(me.party).leave(me.owner)
  await clearPartyMembership(roomCtx, me.owner)
}
