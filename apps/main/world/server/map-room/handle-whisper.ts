import { getSpeechAttempt } from "#/world/core/get-speech-attempt"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state" | "send">
type Props = Readonly<Pick<Ctx, "me" | "save"> & { ctx: Readonly<{ connection: Pick<Connection, "id" | "send">; room: Readonly<{ getConnections(): Iterable<Connection> }> }> }>

/** 同じマップの同じチャンネルにいる、名前の合う人にだけ届ける（game-system.md §12）。連投はふつうの発言と同じく数える。 */
export async function handleWhisper(room: Props, message: Message<"whisper">) {
  const me = room.me
  if (!me.player) return
  const attempt = getSpeechAttempt(me.said, Date.now())
  room.save({ said: attempt.said })
  if (!attempt.canSpeak) return
  const recipients = [...room.ctx.room.getConnections()].filter((connection) => {
    const other = presence(connection)
    return connection.id !== room.ctx.connection.id && !other.closed && other.ready !== false && other.owner !== me.owner && other.player?.name === message.to
  })
  if (!recipients.length) return room.ctx.connection.send({ type: "refused", what: "whisper", reason: "NOT_HERE" })
  for (const recipient of recipients) await notifyClient(recipient.send({ type: "whispered", from: me.player.id, name: me.player.name, text: message.text }))
  await room.ctx.connection.send({ type: "whispered", name: message.to, text: message.text, sent: true })
}
