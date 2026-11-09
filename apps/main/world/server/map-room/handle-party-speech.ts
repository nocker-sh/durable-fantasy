import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import { notifyClient } from "#/world/server/map-room/notifications"
import { deliverPartyChat } from "#/world/server/map-room/deliver-party-chat"
import type { Message } from "#/world/server/map-room/context"
import type { PartyChatContext } from "#/world/server/map-room/party-chat-types"

/** 接続の所属だけで送信を許可せず、本人の保存済み所属と名簿の受付を順に確認する。 */
export async function handlePartySpeech(context: PartyChatContext, message: Message<"party-say">) {
  const me = context.me
  if (!me.player || !me.owner) return
  const player = await Player.get(me.owner).read()
  if (!me.party || player.party !== me.party) {
    await notifyClient(context.ctx.connection.send({ type: "refused", what: "party-chat", reason: "NOT_MEMBER" }))
    return
  }
  const reason = await Party.get(me.party).say(me.owner, message.text)
  if (reason) {
    await notifyClient(context.ctx.connection.send({ type: "refused", what: "party-chat", reason }))
    return
  }
  await deliverPartyChat(context, message.chat)
}
