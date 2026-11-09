import { dayOf } from "#/world/core/day-of"
import { errandToday } from "#/world/core/errand-today"
import type { Errand } from "#/world/core/errand-types"
import { jstMinutes } from "#/world/core/jst-minutes"
import { canAskErrand } from "#/world/maps/can-ask-errand"
import { MAPS } from "#/world/maps/index"
import { npcCell } from "#/world/maps/npc-cell"
import type { MapDefinition } from "#/world/maps/types"

export type ErrandMeeting = { map: MapDefinition; now: number; name: string }
const DAY = 86_400_000
const FIRST_DAY = Date.parse("2026-10-20T21:00:00Z")

/** Select real offers and meetings, without claiming a walking or material-acquisition route. */
export function errandMeetings(errand: Errand): { ask: ErrandMeeting; hand: ErrandMeeting } {
  const recipient = errand.kind === "bring" ? errand.from : errand.to
  for (let day = 0; day < 400; day++) {
    const start = FIRST_DAY + day * DAY
    if (errandToday(errand.from, dayOf(start))?.id !== errand.id) continue
    for (let step = 0; step < 95; step++) {
      const now = start + step * 15 * 60_000
      const map = Object.values(MAPS).find((candidate) => npcCell(candidate, errand.from, jstMinutes(now)))
      // the asker is out and still asks it at this hour
      if (!map || !canAskErrand(errand, jstMinutes(now))) continue
      for (let later = step + 1; later < 96; later++) {
        const handAt = start + later * 15 * 60_000
        const handMap = Object.values(MAPS).find((candidate) => npcCell(candidate, recipient, jstMinutes(handAt)))
        if (handMap) return { ask: { map, now, name: errand.from }, hand: { map: handMap, now: handAt, name: recipient } }
      }
    }
  }
  throw new Error(`${errand.id}: no offer with both meetings before the daily deadline`)
}
