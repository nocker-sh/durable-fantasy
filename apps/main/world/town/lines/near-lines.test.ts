import { expect, it } from "vitest"
import { phase } from "#/world/core/phase"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { ALL_LINES } from "#/world/town/lines/index"
import type { Line } from "#/world/town/lines/line"
import { slotAt } from "#/world/town/slot-at"
import { spotAt } from "#/world/town/spot-at"

const EVERY = Array.from({ length: 288 }, (_, k) => k * 5)
const where = (name: string, minute: number) => spotAt(name, minute, RESIDENT_WORK_SPOTS.get(name)!)

// the speaker is out where the player can meet them, and the named person stands on the same map (parts/lines-for.ts)
const heard = (name: string, line: Line) =>
  EVERY.some((minute) => {
    const speaker = where(name, minute)
    const other = where(line.near!, minute)
    if (!speaker || !other || speaker.map !== other.map) return false
    if (line.phase && !line.phase.includes(phase(minute))) return false
    return !line.doing || !!slotAt(name, minute)?.doing.includes(line.doing)
  })

it("a line about someone nearby can be heard: both are on the same map at some time the speaker is out", () => {
  const unheard = Object.entries(ALL_LINES).flatMap((entry) => {
    const name = entry[0]
    return entry[1].filter((line) => line.near && !heard(name, line)).map((line) => `${name} → ${line.near}: ${line.text}`)
  })
  expect(unheard).toEqual([])
})
