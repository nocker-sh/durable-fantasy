import { cellDistance } from "#/world/maps/cell-distance"
import { CELLS_PER_SECOND } from "#/world/protocol"
import type { Cell } from "#/world/protocol"
import type { Presence } from "#/world/server/map-room/presence"

/** The walking clock once the route's start moves to `to`: the walk there still counts (game-system.md §2). */
export function paceTo(me: Pick<Presence, "route" | "paced" | "since">, to: Cell, now: number): number {
  const from = me.route[0] ?? to
  return Math.max((me.paced ?? me.since) + (cellDistance(from, to) / CELLS_PER_SECOND) * 1000, now)
}
