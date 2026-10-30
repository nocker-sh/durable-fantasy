import type { TownEvent } from "#/world/town/events"
import { jstDate } from "#/world/town/jst-date"
import { townEventHash } from "#/world/town/town-event-hash"

/**
 * The lantern festival is on the 21st of every month (the night the goddess is said to have gone,
 * remembered with lanterns rather than mourning); cold snaps and fogs fall on about one day in ten.
 */
export function eventOf(now: number): TownEvent | null {
  const date = jstDate(now)
  if (date.d === 21) return "灯りの祭り"
  if (date.d === 20) return "祭りの前日"
  const r = townEventHash(date.y * 400 + date.m * 32 + date.d)
  if (r < 0.1) return "寒波"
  if (r < 0.18) return "霧"
  return null
}
