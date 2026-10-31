import type { readPartyChat } from "#/world/core/read-party-chat"
import type { Ctx } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { notifyClient } from "#/world/server/map-room/notifications"

type Props = Readonly<Pick<Ctx, "me"> & { ctx: Readonly<{ connection: Pick<Ctx["ctx"]["connection"], "state" | "send"> }> }>

export async function sendPartyChat(context: Props, batch: ReturnType<typeof readPartyChat>) {
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
