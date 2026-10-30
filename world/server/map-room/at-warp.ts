import { cellDistance } from "#/world/maps/cell-distance"
import { cellsReached } from "#/world/cells-reached"
import type { Cell } from "#/world/protocol"
import type { Presence } from "#/world/server/map-room/presence"

/**
 * At a way out: there now, or about to be. The screen walks a little ahead of the server's count
 * (the walk is sent as it starts), so arriving at the end of a long walk the server may still have
 * them a step or two short. A second's grace, along the route they are already on.
 */
export const atWarp = (me: Presence, at: Cell) => cellsReached(me.route, (Date.now() - me.since) / 1000 + 1).some((c) => cellDistance(c, at) <= 1)
