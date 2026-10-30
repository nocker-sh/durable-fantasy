import { Party } from "#/durable-objects/party"
import type { Ctx } from "#/world/server/map-room/context"
import { sendPartyChat } from "#/world/server/map-room/send-party-chat"

export async function deliverPartyChat(context: Ctx, cursor?: { party: string; seq: number }) {
  const ctx = context.ctx
  const me = context.me

  if (!me.owner || !me.party) return
  const batch = await Party.get(me.party).chat(me.owner, cursor?.party === me.party ? cursor.seq : 0)
  await sendPartyChat({ ctx, me }, batch)
}
