// When each house's windows are lit and when the street lamps are (game-system.md §7.5). A window
// is lit while someone of the household is up indoors (their day is in routines.ts) and it is dark,
// each house at its own moment in the dusk. No dice: every player sees the same windows lit.
import { within } from "../core/clock.ts"
import { RESIDENTS } from "./residents.ts"
import { HOUSEHOLDS, type HouseDef } from "./houses.ts"
import { INTERIORS } from "./interiors.ts"
import { slotAt, spotAt, workSpot } from "./routines.ts"

const H = (h: number, m = 0) => h * 60 + m

/** A spread of 0..1 from a house, the same every time. */
const spread = (seed: number, salt: number) => {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Is anyone of this household up indoors at `min`: home and not asleep, or at work inside this very
 * building (a shop over which they live).
 */
export function upIndoors(h: HouseDef, min: number): boolean {
  const members = HOUSEHOLDS.find((x) => x.id === h.household)?.members ?? []
  const inside = INTERIORS.find((i) => i.house === h)?.id
  return members.some((name) => {
    const s = slotAt(name, min)
    if (!s) return false
    if (s.where === "home") return !s.doing.includes("眠")
    const r = RESIDENTS.find((x) => x.name === name)
    const spot = r && spotAt(name, min, workSpot(r))
    return !!inside && spot?.map === inside
  })
}

/** Are this house's windows lit at `min`: someone is up inside, and it is dark enough to want a light. */
export function windowsLit(h: HouseDef, min: number): boolean {
  if (h.kind === "vacant" || !h.household || !h.plan.hearth) return false
  if (h.household === "guards") return within(min, H(15, 50), H(9, 30)) // a shift is always up in the guardhouse
  // each house lights its lamp at its own moment in the dusk (15:50–17:10) and puts it out at its
  // own moment once the day comes (9:10–10:30)
  const on = H(15, 50) + Math.round(spread(h.seed, 3) * 80),
    off = H(9, 10) + Math.round(spread(h.seed, 4) * 80)
  return upIndoors(h, min) && within(min, on, off)
}

/**
 * The street lamps: the guard lights them one after another at dusk, starting at 16:40 and taking a
 * minute or so for each, and puts them out in the same order once the day is up.
 */
export function lampLit(index: number, min: number): boolean {
  const on = H(16, 40) + Math.round(index * 1.3),
    off = H(10, 20) + Math.round(index * 1.1)
  return within(min, on % 1440, off % 1440)
}
