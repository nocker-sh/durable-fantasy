import { Party } from "#/durable-objects/party"
import { sendPartyView } from "#/world/server/map-room/send-party-view"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<Pick<Ctx, "me"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "id" | "state" | "setState" | "send"> }> }>

/** 分配の変更権限は保存先で判定し、本人向けの表示だけを返す。 */
export async function handlePartyMode(roomCtx: Props, message: Message<"party-mode">) {
  const ctx = roomCtx.ctx
  const me = roomCtx.me
  if (!me.owner || !me.party) return
  await sendPartyView({ connection: ctx.connection, party: await Party.get(me.party).setMode(me.owner, message.mode), partyId: me.party, owner: me.owner })
  return
}
