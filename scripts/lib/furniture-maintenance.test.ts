import { expect, it } from "vitest"
import { auditFurnitureMaintenance } from "#/scripts/lib/furniture-maintenance"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const resident = base("resident-a", "residents")
  const room: SettingDocument = {
    ...base("room-a", "rooms"),
    building: "building-a",
    furniture: [{ symbol: "T", name: "食卓", owner: "家", source: "木工所", rect: [1, 1, 2, 2], access: [[3, 1]], maintainers: [resident.id] }],
  }
  const building: SettingDocument = { ...base("building-a", "buildings"), rooms: [room.id], residents: [resident.id] }
  return { resident, room, building, documents: new Map([resident, room, building].map((d) => [d.id, d])) }
}
it("accepts a household member caring for the home's furniture", () => {
  expect(auditFurnitureMaintenance(fixture().documents)).toEqual([])
})
it("accepts a worker in a workplace where they do not live", () => {
  const f = fixture()
  f.building.residents = []
  f.building.workers = [f.resident.id]
  f.resident.work_rooms = [f.room.id]
  f.room.occupants = [f.resident.title]
  expect(auditFurnitureMaintenance(f.documents)).toEqual([])
  f.resident.work_rooms = []
  expect(auditFurnitureMaintenance(f.documents)).toContain("room-a: T: maintainer does not belong to this home or workplace")
})
it("rejects another household, a missing person, and the wrong document kind", () => {
  for (const mutate of [
    (f: ReturnType<typeof fixture>) => {
      f.building.residents = []
    },
    (f: ReturnType<typeof fixture>) => {
      f.documents.delete(f.resident.id)
    },
    (f: ReturnType<typeof fixture>) => {
      f.resident.kind = "buildings"
    },
  ]) {
    const f = fixture()
    mutate(f)
    expect(auditFurnitureMaintenance(f.documents)).toContain("room-a: T: maintainer does not belong to this home or workplace")
  }
})
it("rejects duplicate and empty assignments", () => {
  const f = fixture()
  for (const ids of [[], [f.resident.id, f.resident.id]]) {
    f.room.furniture![0].maintainers = ids
    expect(auditFurnitureMaintenance(f.documents)).toContain("room-a: T: invalid maintenance assignment")
  }
})
it("requires an assignment at completion but leaves unfinished plans visibly unfinished", () => {
  const f = fixture()
  delete f.room.furniture![0].maintainers
  expect(auditFurnitureMaintenance(f.documents)).toEqual([])
  f.room.design_gate = "通過"
  expect(auditFurnitureMaintenance(f.documents)).toContain("room-a: T: completed furniture has no maintenance assignment")
})
it("does not accept a room omitted from the household's inventory", () => {
  const f = fixture()
  f.building.rooms = []
  expect(auditFurnitureMaintenance(f.documents)).toContain("room-a: T: maintainer does not belong to this home or workplace")
})

it("does not grant access to another person's private room through household membership", () => {
  const f = fixture()
  f.room.private_for = ["resident-other"]
  expect(auditFurnitureMaintenance(f.documents)).toContain("room-a: T: maintainer has no access to this private room")
  f.room.private_for = [f.resident.id]
  expect(auditFurnitureMaintenance(f.documents)).toEqual([])
})
