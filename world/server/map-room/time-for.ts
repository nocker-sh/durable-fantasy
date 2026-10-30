import { jstMinutes } from "#/world/core/jst-minutes"
import type { Presence } from "#/world/server/map-room/presence"

/** The time of day for this player: Japan's, or in dev the time their clock is held at. */
export const timeFor = (me: Presence) => (import.meta.env.DEV && me.held != null ? me.held : jstMinutes(Date.now()))
