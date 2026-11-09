import { expect, it } from "vitest"
import { phase } from "#/world/core/phase"
import { ALL_LINES } from "#/world/town/lines/index"
import type { Line } from "#/world/town/lines/line"
import { RESIDENTS } from "#/world/town/residents"
import { slotAt } from "#/world/town/slot-at"

const DAY = Array.from({ length: 1440 }, (_, minute) => minute)
const NAMES = RESIDENTS.map((resident) => resident.name)
const slotOf = (name: string, minute: number) => slotAt(name, ((minute % 1440) + 1440) % 1440)
const clock = (minute: number) => `${Math.floor(minute / 60)}:${String(minute % 60).padStart(2, "0")}`

// out where the player can meet them, with the line's conditions met (parts/lines-for.ts)
const heardAt = (name: string, line: Line, minute: number) => {
  const slot = slotAt(name, minute)
  if (!slot || slot.where === "home") return false
  if (line.phase && !line.phase.includes(phase(minute))) return false
  return !line.doing || slot.doing.includes(line.doing)
}

// once the slot they are in now ends, they stay at home until they sleep
const lastOuting = (name: string, minute: number) => {
  const now = slotOf(name, minute)
  let later = minute
  while (later < minute + 1440 && slotOf(name, later) === now) later++
  for (; later < minute + 1440; later++) {
    const slot = slotOf(name, later)
    if (slot?.where !== "home") return false
    if (slot.doing.includes("眠")) return true
  }
  return false
}

it("a line about going home to bed is said on the speaker's last outing before they sleep", () => {
  const early = Object.entries(ALL_LINES).flatMap((entry) => {
    const name = entry[0]
    // their own bed, not that of someone they name
    const own = entry[1].filter((line) => line.text.includes("帰って寝") && !NAMES.some((other) => other !== name && line.text.includes(other)))
    return own.flatMap((line) => {
      const minute = DAY.find((m) => heardAt(name, line, m) && !lastOuting(name, m))
      return minute === undefined ? [] : [`${name} at ${clock(minute)}: ${line.text}`]
    })
  })
  expect(early).toEqual([])
})
