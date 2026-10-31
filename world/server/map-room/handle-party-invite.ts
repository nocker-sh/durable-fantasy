import { Party } from "#/durable-objects/party"
import { presence } from "#/world/server/map-room/presence"
import { getPartyInvitationRejection } from "#/world/server/map-room/get-party-invitation-rejection"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send">
type Props = Readonly<{ me: Ctx["me"]; save: Ctx["save"]; ctx: Readonly<{ connection: Pick<Connection, "id" | "send">; room: Readonly<{ getConnection(id: string): Connection | undefined }> }> }>

/** 招待は相手を所属させず、既存の同行者がいる場合はリーダーかどうかと空きを先に確かめる。 */
export async function handlePartyInvite(roomCtx: Props, message: Message<"party-invite">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  const them = ctx.room.getConnection(message.target)
  const other = them && presence(them)
  if (!me.player || !me.owner || !them || !other?.player || other.party || them.id === ctx.connection.id) {
    await ctx.connection.send({ type: "party-closed", reason: "BUSY" })
    return
  }
  if (me.party) {
    const reason = getPartyInvitationRejection(await Party.get(me.party).view(), me.owner)
    if (reason) {
      await ctx.connection.send({ type: "party-closed", reason })
      return
    }
  }
  roomCtx.save({ inviting: them.id })
  await them.send({ type: "party-invited", from: ctx.connection.id, name: me.player.name })
  return
}
