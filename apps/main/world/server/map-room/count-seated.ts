import { presence } from "#/world/server/map-room/presence"
import type { Ctx } from "#/world/server/map-room/context"

type Connection = Pick<Ctx["ctx"]["connection"], "id" | "state">

/**
 * How many already hold a seat in this room: those in it and those still joining, but not the one
 * asking now nor a socket already closing. The directory takes this as the truth for the channel, so
 * a seat whose leaving was never counted (a dropped socket) is given back at the next arrival.
 */
export function countSeated(connections: Iterable<Connection>, asking: string): number {
  let seated = 0
  for (const connection of connections) {
    if (connection.id === asking) continue
    const other = presence(connection)
    if (other.closed || (!other.player && !other.joining)) continue
    seated++
  }
  return seated
}
