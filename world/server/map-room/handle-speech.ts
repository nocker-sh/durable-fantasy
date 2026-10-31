import { getSpeechAttempt } from "#/world/core/get-speech-attempt"
import { canReceiveSpeech } from "#/world/server/map-room/can-receive-speech"
import { presence } from "#/world/server/map-room/presence"
import { reachable } from "#/world/server/map-room/reachable"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send">
type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Connection, "id">; room: Readonly<{ getConnections(): Iterable<Connection> }> }> }>

/** 連投の試行を先に保存し、各受信者を送信の直前に判定する。 */
export async function handleSpeech(room: Props, message: Message<"say">) {
  const me = room.me
  if (!me.player) return
  const attempt = getSpeechAttempt(me.said, Date.now())
  room.save({ said: attempt.said })
  if (!attempt.canSpeak) return
  const shout = !!message.shout
  const origin = reachable(me)[0]
  for (const recipient of room.ctx.room.getConnections()) {
    if (!canReceiveSpeech({ senderId: room.ctx.connection.id, recipientId: recipient.id, recipient: presence(recipient), origin, shout })) continue
    await notifyClient(recipient.send({ type: "said", id: me.player.id, text: message.text, shout }))
  }
}
