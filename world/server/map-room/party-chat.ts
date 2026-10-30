import { Party } from "#/durable-objects/party"
import { Player } from "#/durable-objects/player"
import type { Handlers } from "#/world/server/map-room/context"
import { notifyClient } from "#/world/server/map-room/notifications"
import { deliverPartyChat } from "#/world/server/map-room/deliver-party-chat"

export const HANDLERS: Handlers = {
  async "party-say"(context, message) {
    const ctx = context.ctx
    const me = context.me
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
