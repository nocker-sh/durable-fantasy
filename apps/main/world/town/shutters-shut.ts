import { within } from "#/world/core/within"
import { HOUSEHOLDS } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import { slotAt } from "#/world/town/slot-at"
import { scheduleMinute } from "#/world/town/schedule-minute"
import { windowSpread } from "#/world/town/window-spread"
import { upIndoors } from "#/world/town/up-indoors"
import { windowsLit } from "#/world/town/windows-lit"

/**
 * Are this house's shutters closed at `min`. An empty house keeps them shut. A household shuts them
 * when it goes to sleep with the day coming up and opens them when the first of it is up: in the
 * light of day, while someone sleeps at home and nobody is up inside. The guardhouse always has a
 * shift awake, so it never shuts.
 */
export function shuttersShut(h: HouseDef, min: number): boolean {
  if (h.kind === "vacant" || !h.household) return h.kind === "vacant"
  if (h.household === "guards" || !h.plan.hearth) return false
  if (windowsLit(h, min) || upIndoors(h, min)) return false
  // the dark hours of this house (as for its lamp): shutters are for keeping the day out
  const on = scheduleMinute(15, 50) + Math.round(windowSpread(h.seed, 3) * 80),
    off = scheduleMinute(9, 10) + Math.round(windowSpread(h.seed, 4) * 80)
  if (within(min, on, off)) return false
  const members = HOUSEHOLDS.find((x) => x.id === h.household)?.members ?? []
  return members.some((name) => {
    const s = slotAt(name, min)
    return s?.where === "home" && s.doing.includes("眠")
  })
}
