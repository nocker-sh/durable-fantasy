import type { PlayerCommandContext } from "#/world/server/map-room/player-command-types"
import { notifyClient } from "#/world/server/map-room/notifications"
import { getCommandShopAccess } from "#/world/server/map-room/get-command-shop-access"
import { runMapPlayerCommand } from "#/world/server/map-room/run-map-player-command"
import { publishCommandPlayer } from "#/world/server/map-room/publish-command-player"
import type { Message } from "#/world/server/map-room/context"

/** Apply confirmed sitting and profile updates even when the result notification cannot be delivered. */
export async function handlePlayerCommand(context: PlayerCommandContext, message: Message<"command">): Promise<void> {
  const me = context.me
  if (!me.player || !me.owner) return
  const access = getCommandShopAccess(context, message.command)
  if (!access.ok) {
    await context.ctx.connection.send({ type: "result", seq: message.seq, result: access })
    return
  }
  const result = await runMapPlayerCommand({ context, message, owner: me.owner, keepers: access.keepers })
  if (result.ok && (message.command.type === "sit" || message.command.type === "stand")) context.save({ sitting: result.state.sitting })
  await notifyClient(context.ctx.connection.send({ type: "result", seq: message.seq, result }))
  if (result.ok) await publishCommandPlayer({ context, player: me.player, state: result.state })
}
