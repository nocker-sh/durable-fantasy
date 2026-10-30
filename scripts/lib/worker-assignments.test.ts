import { expect, it } from "vitest"
import { auditWorkerAssignments } from "./worker-assignments"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
function fixture() {
  const resident = { ...base("resident-a", "residents"), buildings: ["building-home"], bedroom: "room-home", bed_id: "bed-home", work_rooms: ["room-shop"] }
  const shop = { ...base("building-shop", "buildings"), residents: [], rooms: ["room-shop"], workers: [resident.id] }
  const room = { ...base("room-shop", "rooms"), building: shop.id, occupants: [resident.title] }
  return { resident, shop, room, documents: new Map<string, SettingDocument>([resident, shop, room].map((d) => [d.id, d])) }
}
it("links a worker from another household without changing their home or bed", () => {
  const f = fixture(),
    home = JSON.stringify([f.resident.buildings, f.resident.bedroom, f.resident.bed_id])
  expect(auditWorkerAssignments(f.documents)).toEqual([])
  expect(JSON.stringify([f.resident.buildings, f.resident.bedroom, f.resident.bed_id])).toBe(home)
  expect(f.shop.residents).toEqual([])
})
it("requires the room's user list to include its worker", () => {
  const f = fixture()
  f.room.occupants = []
  expect(auditWorkerAssignments(f.documents)).toContain("resident-a: work room does not include this worker")
})
it("requires the building to acknowledge the worker assigned to its room", () => {
  const f = fixture()
  f.shop.workers = []
  expect(auditWorkerAssignments(f.documents)).toContain("resident-a: work room has no matching building staff assignment")
})
it("requires staff to have a work room in that building rather than an unrelated job", () => {
  const f = fixture()
  f.room.building = "building-other"
  expect(auditWorkerAssignments(f.documents)).toContain("building-shop: worker has no matching work room")
})
it("does not count duplicate IDs as additional workers or rooms", () => {
  const f = fixture()
  f.shop.workers.push(f.resident.id)
  f.resident.work_rooms.push(f.room.id)
  expect(auditWorkerAssignments(f.documents)).toContain("building-shop: duplicate worker")
  expect(auditWorkerAssignments(f.documents)).toContain("resident-a: duplicate work room")
})
it("allows drafts without declared work assignments without inventing employment", () => {
  expect(auditWorkerAssignments(new Map([["resident-a", base("resident-a", "residents")]]))).toEqual([])
})

it("does not accept a claimed work room missing from the building inventory", () => {
  const f = fixture()
  f.shop.rooms = []
  expect(auditWorkerAssignments(f.documents)).toContain("resident-a: work room is missing from its building inventory")
  expect(auditWorkerAssignments(f.documents)).toContain("building-shop: worker has no matching work room")
})

it("checks a workplace's common home against each worker's actual bedroom", () => {
  const f = fixture()
  f.documents.get(f.shop.id)!.home_building = "building-home"
  const home = { ...base("building-home", "buildings"), residents: [f.resident.id] }
  const bedroom = { ...base("room-home", "rooms"), building: home.id }
  f.documents.set(home.id, home)
  f.documents.set(bedroom.id, bedroom)
  expect(auditWorkerAssignments(f.documents)).toEqual([])
  bedroom.building = f.shop.id
  expect(auditWorkerAssignments(f.documents)).toContain("building-shop: worker does not live in its declared home: resident-a")
})
it("does not use a missing home or another household as the common return address", () => {
  const f = fixture()
  f.documents.get(f.shop.id)!.home_building = "building-home"
  expect(auditWorkerAssignments(f.documents)).toContain("building-shop: workplace has no matching home building")
  f.documents.set("building-home", { ...base("building-home", "buildings"), residents: [] })
  expect(auditWorkerAssignments(f.documents)).toContain("building-shop: worker does not live in its declared home: resident-a")
})
