import { Party } from "../../../durable-objects/party.ts"
import { Player } from "../../../durable-objects/player.ts"
import type { readPartyChat } from "../../core/party-chat.ts"
import type { Ctx, Handlers } from "./context.ts"
import { presence } from "./presence.ts"
import { notifyClient } from "./notifications.ts"

export async function deliverPartyChat({ ctx, me }: Ctx, cursor?: { party: string; seq: number }) {
  if (!me.owner || !me.party) return
  const batch = await Party.get(me.party).chat(me.owner, cursor?.party === me.party ? cursor.seq : 0)
  await sendPartyChat({ ctx, me }, batch)
}

export async function sendPartyChat({ ctx, me }: Pick<Ctx, "ctx" | "me">, batch: ReturnType<typeof readPartyChat>) {
  if (!batch || !me.party || presence(ctx.connection).closed) return
  await notifyClient(
    ctx.connection.send({
      type: "party-chat",
      party: me.party,
      seq: batch.seq,
      lines: batch.lines.map(({ seq, owner, name, text }) => ({ seq, name, text, self: owner === me.owner })),
    }),
  )
}

export const HANDLERS: Handlers = {
  async "party-say"(context, message) {
    const { ctx, me } = context
    if (!me.player || !me.owner) return
    const player = await Player.get(me.owner).read()
    const reason = !me.party || player.party !== me.party ? "NOT_MEMBER" : await Party.get(me.party).say(me.owner, message.text)
    if (reason) {
      await notifyClient(ctx.connection.send({ type: "refused", what: "party-chat", reason }))
      return
    }
    await deliverPartyChat(context, message.chat)
  },
}
