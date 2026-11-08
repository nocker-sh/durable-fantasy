import type { readPartyChat } from "#/world/core/read-party-chat"
import type { PartyChatContext } from "#/world/server/map-room/party-chat-types"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"

/** 所有者の識別子と記録時刻を公開せず、終了した接続への送信は止める。 */
export async function sendPartyChat(context: PartyChatContext, batch: ReturnType<typeof readPartyChat>) {
  const ctx = context.ctx
  const me = context.me

  if (!batch || !me.party || presence(ctx.connection).closed) return
  await notifyClient(
    ctx.connection.send({
      type: "party-chat",
      party: me.party,
      seq: batch.seq,
      lines: batch.lines.map((line) => ({ seq: line.seq, name: line.name, text: line.text, self: line.owner === me.owner })),
    }),
  )
}
