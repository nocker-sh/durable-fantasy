import { Player } from "#/durable-objects/player"
import { Market } from "#/durable-objects/market"
import { minutesToClose } from "#/world/maps/minutes-to-close"
import { TOWN } from "#/world/server/map-room/presence"
import { timeFor } from "#/world/server/map-room/time-for"
import type { Transition } from "#/world/core/transition"
import type { Ctx, Message } from "#/world/server/map-room/context"

type Props = Readonly<{ context: { me: Ctx["me"]; ctx: { connection: Pick<Ctx["ctx"]["connection"], "id"> } }; owner: string; message: Message<"command">; keepers: string[] | null }>

/** Shop commands keep the durable reservation-and-finish boundary; other commands remain player-local. */
export async function runMapPlayerCommand(props: Props): Promise<Transition> {
  const command = props.message.command
  if (command.type !== "buy" && command.type !== "sell") return Player.get(props.owner).run(command, props.keepers ? { keepers: props.keepers } : {})
  const market = Market.get(TOWN)
  const request = await market.beginTrade({
    owner: props.owner,
    connection: props.context.ctx.connection.id,
    seq: props.message.seq,
    command,
    keepers: props.keepers ?? [],
    toClose: minutesToClose(command.shop, timeFor(props.context.me)),
  })
  if (!request.ok) return request
  return market.finishTrade(props.owner, request.id)
}
