import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditHotWork } from "./hot-work"
function fixture() {
  const read = (path: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
  const room = read("rooms/room-smithy-1"),
    building = read("buildings/building-smithy"),
    handler = read("residents/resident-ギュンター")
  return { room, building, handler, documents: new Map([room, building, handler].map((d) => [d.id, d])) }
}
it("keeps the authored forge, hot cooling, finished goods and fuel distinct", () => {
  const f = fixture(),
    before = JSON.stringify([...f.documents])
  expect(auditHotWork(f.documents)).toEqual([])
  expect(JSON.stringify([...f.documents])).toBe(before)
})
it("does not reuse the forge as the cold finished-goods shelf", () => {
  const f = fixture()
  ;(f.room.hot_work as { finished: string[] }).finished = ["F"]
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot-work zones reuse the same furniture")
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot work has no matching finished_storage furniture")
})
it("does not label ordinary furniture as the industrial cooling area", () => {
  const f = fixture()
  f.room.furniture!.find((v) => v.symbol === "B")!.role = "storage"
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot work has no matching hot_cooling furniture")
})
it("requires a handler with a real work assignment", () => {
  const f = fixture()
  f.building.workers = []
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot-work handler has no matching work assignment")
})
it("does not overlook industrial heat when its plan is omitted", () => {
  const f = fixture()
  delete f.room.hot_work
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Industrial heat furniture has no hot-work plan")
})

it("keeps wax heating separate from a metal forge and still requires distinct cooling and fuel", () => {
  const f = fixture()
  ;(f.room.hot_work as { process?: string }).process = "wax"
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot work has no matching wax_heater furniture")
  f.room.furniture!.find((v) => v.symbol === "F")!.role = "wax_heater"
  f.room.furniture!.find((v) => v.symbol === "B")!.role = "wax_cooling"
  expect(auditHotWork(f.documents)).toEqual([])
  delete f.room.hot_work
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Industrial heat furniture has no hot-work plan")
})

it("uses food-specific heating and cooling roles for smoking and rejects an omitted plan", () => {
  const f = fixture()
  ;(f.room.hot_work as { process?: string }).process = "smoking"
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot work has no matching smoking_heat furniture")
  f.room.furniture!.find((v) => v.symbol === "F")!.role = "smoking_heat"
  f.room.furniture!.find((v) => v.symbol === "B")!.role = "smoked_food_cooling"
  expect(auditHotWork(f.documents)).toEqual([])
  delete f.room.hot_work
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Industrial heat furniture has no hot-work plan")
})

it("requires dedicated repair heating and cooling instead of a food or wax work surface", () => {
  const f = fixture()
  ;(f.room.hot_work as { process?: string }).process = "metal_repair"
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Hot work has no matching repair_heat furniture")
  f.room.furniture!.find((v) => v.symbol === "F")!.role = "repair_heat"
  f.room.furniture!.find((v) => v.symbol === "B")!.role = "repair_cooling"
  expect(auditHotWork(f.documents)).toEqual([])
  delete f.room.hot_work
  expect(auditHotWork(f.documents)).toContain("room-smithy-1: Industrial heat furniture has no hot-work plan")
})
