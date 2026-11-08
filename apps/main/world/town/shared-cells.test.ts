import { expect, it } from "vitest"
import { cellOfSpot } from "#/world/maps/cell-of-spot"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { RESIDENTS } from "#/world/town/residents"
import { spotAt } from "#/world/town/spot-at"

const clock = (minute: number) => `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`

it("no two residents stand on the same cell at the same time: they would be drawn on top of each other", () => {
  const shared: string[] = []
  for (let minute = 0; minute < 24 * 60; minute += 5) {
    const standing = new Map<string, string>()
    for (const resident of RESIDENTS) {
      const work = RESIDENT_WORK_SPOTS.get(resident.name)
      if (!work) continue
      const spot = spotAt(resident.name, minute, work)
      const cell = spot && cellOfSpot(spot)
      if (!spot || !cell) continue
      const key = `${spot.map}:${cell[0]},${cell[1]}`
      const other = standing.get(key)
      if (other) shared.push(`${clock(minute)} ${key} ${other} + ${resident.name}`)
      else standing.set(key, resident.name)
    }
  }
  expect(shared).toEqual([])
})
