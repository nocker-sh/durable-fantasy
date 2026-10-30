import { expect, it } from "vitest"
import { auditPersonalStorage } from "./personal-storage"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const resident = { ...base("resident-a", "residents"), storage_ids: ["storage-a"] }
  const slot = { id: "storage-a", resident: resident.id, contents: ["衣服", "首巻き", "私物"], furniture_symbol: null as string | null, compartment: "個人区画" }
  const room: SettingDocument = { ...base("room-a", "rooms"), building: "building-a", personal_storage: [slot], sleeping_places: [{ resident: resident.id, storage_id: slot.id }] }
  const building = { ...base("building-a", "buildings"), residents: [resident.id] }
  return {
    resident,
    room,
    slot,
    building,
    docs: new Map<string, SettingDocument>([
      [resident.id, resident],
      [room.id, room],
      [building.id, building],
    ]),
  }
}
it("distinguishes a personal assignment from a placed storage cabinet", () => {
  const f = fixture()
  expect(auditPersonalStorage(f.docs)).toEqual([])
  f.room.design_gate = "通過"
  expect(auditPersonalStorage(f.docs)).toContain("storage-a: storage has no grid placement")
})
it("does not assign another resident's cabinet as personal storage", () => {
  const f = fixture()
  f.slot.furniture_symbol = "C"
  f.room.grid = { cell_m: 0.5, rows: ["C"] }
  f.room.furniture = [{ symbol: "C", role: "storage", name: "箱", owner: "別人", source: "大工", rect: [0, 0, 1, 1], access: [[0, 1]] }]
  expect(auditPersonalStorage(f.docs)).toContain("storage-a: storage furniture or owner does not match")
})
it("keeps distinct personal compartments in a shared cabinet and rejects duplicate physical assignments", () => {
  const f = fixture(),
    second = { ...base("resident-b", "residents"), storage_ids: ["storage-b"] }
  f.docs.set(second.id, second)
  f.building.residents.push(second.id)
  f.slot.furniture_symbol = "C"
  f.slot.compartment = "上段"
  const other = { ...f.slot, id: "storage-b", resident: second.id, compartment: "下段" }
  f.room.personal_storage = [f.slot, other]
  f.room.grid = { cell_m: 0.5, rows: ["C"] }
  f.room.furniture = [
    { symbol: "C", role: "storage", name: "共用箱", owner: "二人", owners: [f.resident.title, second.title], compartments: ["上段", "下段"], source: "大工", rect: [0, 0, 1, 1], access: [[0, 1]] },
  ]
  expect(auditPersonalStorage(f.docs)).toEqual([])
  other.compartment = "上段"
  expect(auditPersonalStorage(f.docs)).toContain("storage-b: personal compartment is already assigned")
})
it("checks the bed's storage owner and reciprocal resident references", () => {
  const f = fixture()
  f.resident.storage_ids = ["missing"]
  expect(auditPersonalStorage(f.docs)).toContain("resident-a: unresolved or inconsistent personal storage")
  f.room.sleeping_places = [{ resident: "resident-b", storage_id: f.slot.id }]
  expect(auditPersonalStorage(f.docs)).toContain("room-a: bed and personal storage owner disagree")
})
it("does not treat arbitrary labels in a cabinet as designed compartments", () => {
  const f = fixture()
  f.slot.furniture_symbol = "C"
  f.slot.compartment = "存在しない棚"
  f.room.grid = { cell_m: 0.5, rows: ["C"] }
  f.room.furniture = [{ symbol: "C", role: "storage", name: "箱", owner: f.resident.title, compartments: ["全体"], source: "大工", rect: [0, 0, 1, 1], access: [[0, 1]] }]
  expect(auditPersonalStorage(f.docs)).toContain("storage-a: compartment is not defined on the storage furniture")
})
it("does not leave a resident's belongings unplaced inside an otherwise drawn room", () => {
  const f = fixture()
  f.room.grid = { cell_m: 0.5, rows: ["..."] }
  expect(auditPersonalStorage(f.docs)).toContain("storage-a: storage has no grid placement")
})
