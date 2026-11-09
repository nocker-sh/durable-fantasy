import { cellsReached } from "#/world/cells-reached"
import type { Presence } from "#/world/server/map-room/presence"

/** Where the player may be right now. */
export const reachable = (me: Presence) => cellsReached(me.route, (Date.now() - me.since) / 1000)
