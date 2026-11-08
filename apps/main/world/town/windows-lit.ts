import { within } from "#/world/core/within"
import type { HouseDef } from "#/world/town/house-types"
import { INTERIORS } from "#/world/town/interiors"
import { scheduleMinute } from "#/world/town/schedule-minute"
import { windowSpread } from "#/world/town/window-spread"
import { upIndoors } from "#/world/town/up-indoors"
import { roomInUse } from "#/world/town/room-in-use"

/** Are this house's windows lit at `min`: someone is up inside, and it is dark enough to want a light. */
export function windowsLit(h: HouseDef, min: number, floor?: number): boolean {
  if (h.authored && h.kind === "public") {
    const used = floor === undefined ? INTERIORS.filter((it) => it.house.id === h.id).some((it) => roomInUse(h, it.floor, min)) : roomInUse(h, floor, min)
    return used && within(min, scheduleMinute(15, 50) + Math.round(windowSpread(h.seed, 3) * 80), scheduleMinute(9, 10) + Math.round(windowSpread(h.seed, 4) * 80))
  }
  if (h.kind === "vacant" || !h.household || !h.plan.hearth) return false
  if (h.household === "guards") return within(min, scheduleMinute(15, 50), scheduleMinute(9, 30)) // a shift is always up in the guardhouse
  // each house lights its lamp at its own moment in the dusk (15:50–17:10) and puts it out at its
  // own moment once the day comes (9:10–10:30)
  const on = scheduleMinute(15, 50) + Math.round(windowSpread(h.seed, 3) * 80),
    off = scheduleMinute(9, 10) + Math.round(windowSpread(h.seed, 4) * 80)
  return upIndoors(h, min) && within(min, on, off)
}
