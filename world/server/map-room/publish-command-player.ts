import { notifyClient } from "#/world/server/map-room/notifications"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Ctx } from "#/world/server/map-room/context"
import type { MapPlayer } from "#/world/protocol"
import type { PlayerState } from "#/world/core/player-types"

type Props = Readonly<{ context: Ctx; player: MapPlayer; state: PlayerState }>

/** Save the confirmed public profile before announcing it; a lost notification cannot revert the player. */
export async function publishCommandPlayer(props: Props): Promise<void> {
  const next = mapPlayer(props.player.id, props.state, props.player.at)
  const changed =
    props.context.me.ready === false ||
    next.name !== props.player.name ||
    next.look !== props.player.look ||
    next.neck !== props.player.neck ||
    next.neckRamp !== props.player.neckRamp ||
    next.neckStripe !== props.player.neckStripe ||
    next.weapon !== props.player.weapon
  if (!changed) return
  props.context.save({ player: next, ready: props.state.profileComplete })
  await notifyClient(props.context.ctx.room.broadcast({ type: "joined", player: next }, [props.context.ctx.connection.id]))
}
