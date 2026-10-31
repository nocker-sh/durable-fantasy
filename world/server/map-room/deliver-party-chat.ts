import { Party } from "#/durable-objects/party"
import type { PartyChatContext } from "#/world/server/map-room/party-chat-types"
import { sendPartyChat } from "#/world/server/map-room/send-party-chat"

/** 同じパーティの会話番号だけを引き継ぎ、別の所属時の番号で履歴を飛ばさない。 */
export async function deliverPartyChat(context: PartyChatContext, cursor?: { party: string; seq: number }) {
  const ctx = context.ctx
  const me = context.me

  if (!me.owner || !me.party) return
  const batch = await Party.get(me.party).chat(me.owner, cursor?.party === me.party ? cursor.seq : 0)
  await sendPartyChat({ ctx, me }, batch)
}
