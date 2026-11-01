import { threadKey } from "#/world/core/thread-key"
import { presence } from "#/world/server/map-room/presence"
import type { PlayerState } from "#/world/core/player-types"
import type { Ctx } from "#/world/server/map-room/context"

type Props = Readonly<{ owner: string; player: Pick<PlayerState, "party" | "threads">; connections: Iterable<Pick<Ctx["ctx"]["connection"], "state">> }>

/** この部屋に、同じパーティの仲間か糸を交換した相手が入っているか（game-system.md §1.1 の定員の超過）。 */
export function hasCompanionHere(props: Props): boolean {
  const keys = new Set(props.player.threads.map((thread) => thread.key))
  for (const connection of props.connections) {
    const other = presence(connection)
    if (!other.owner || other.owner === props.owner || !other.player || other.ready === false || other.closed) continue
    if (props.player.party && other.party === props.player.party) return true
    if (keys.has(threadKey(other.owner))) return true
  }
  return false
}
