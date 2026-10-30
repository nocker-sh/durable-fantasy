import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { compileRoomFixtures } from "./room-fixtures"
const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
const building = read("buildings", "building-h-m5"),
  rooms = (building.rooms as string[]).map((id) => read("rooms", id))
it("retains the planned windows and lights on their correct floors", () => {
  const result = compileRoomFixtures(building, rooms)
  expect(result.windows).toHaveLength(3)
  expect(result.lamps).toHaveLength(3)
  expect(result.windows.filter((w) => w.floor === 1)).toHaveLength(1)
  expect(result.lamps.every((l) => l.bottom >= 2 && l.top < l.ceiling)).toBe(true)
})
it("rejects a hanging light below standing headroom", () => {
  const changed = structuredClone(rooms)
  ;(changed[0].lamps as { bottom_m: number }[])[0].bottom_m = 1.6
  expect(() => compileRoomFixtures(building, changed)).toThrow("standing headroom")
})
it("rejects a window blocked by the upper chimney shaft", () => {
  const changed = structuredClone(rooms),
    upper = changed.find((r) => r.id === "room-h-m5-2")!
  ;(upper.windows as { offset_m: number }[])[0].offset_m = 5.25
  expect(() => compileRoomFixtures(building, changed)).toThrow("Window intersects furniture")
})
