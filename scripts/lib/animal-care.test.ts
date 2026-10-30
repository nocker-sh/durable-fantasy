import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditAnimalCare } from "./animal-care"
import { townAnimalSpawns } from "../../world/town/animals"
function fixture() {
  const read = (path: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
  const room = read("rooms/room-coop-1"),
    building = read("buildings/building-coop"),
    keeper = read("residents/resident-ウルリケ")
  return { room, building, keeper, documents: new Map([room, building, keeper].map((d) => [d.id, d])), animals: townAnimalSpawns() }
}
it("binds the authored chicken room to real animal IDs without claiming capacity or mutating the plan", () => {
  const f = fixture(),
    before = JSON.stringify([...f.documents])
  expect(auditAnimalCare(f.documents, f.animals)).toEqual([])
  expect(JSON.stringify([...f.documents])).toBe(before)
})
it("rejects an unknown animal or a different species in the chicken room", () => {
  const f = fixture()
  const care = f.room.animal_care as { population_ids: string[] }
  care.population_ids = ["hen-missing", "cat-1"]
  expect(auditAnimalCare(f.documents, f.animals)).toContain("room-coop-1: Animal identity or kind does not match: cat-1")
})
it("does not assign the same animal to two homes", () => {
  const f = fixture(),
    other = structuredClone(f.room)
  other.id = "room-other"
  f.documents.set(other.id, other)
  ;(f.building.rooms as string[]).push(other.id)
  ;(f.keeper.work_rooms as string[]).push(other.id)
  expect(auditAnimalCare(f.documents, f.animals)).toContain("room-other: Animal has more than one housing assignment: hen-1")
})
it("does not count a human bed as a roost", () => {
  const f = fixture()
  f.room.furniture!.find((v) => v.symbol === "R")!.role = "bed"
  expect(auditAnimalCare(f.documents, f.animals)).toContain("room-coop-1: Animal care has no matching animal_roost furniture")
})
it("requires a keeper with a real assignment to the room and building", () => {
  const f = fixture()
  f.building.workers = []
  expect(auditAnimalCare(f.documents, f.animals)).toContain("room-coop-1: Animal keeper has no matching work assignment")
})
it("does not certify unverified animal capacity", () => {
  const f = fixture()
  f.room.design_gate = "通過"
  expect(auditAnimalCare(f.documents, f.animals)).toContain("room-coop-1: Animal housing capacity and operation remain unverified")
})
