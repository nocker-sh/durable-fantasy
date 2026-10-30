import { expect, it } from "vitest"
import { auditPrivateRoomAccess } from "#/scripts/lib/private-room-access"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
function fixture() {
  const a = { ...base("resident-a", "residents"), bedroom: "room-a" },
    b = { ...base("resident-b", "residents"), bedroom: "room-b" }
  const hall = { ...base("room-hall", "rooms"), building: "building-home", floor: 0, connections: [{ target: "map-town" }, { target: "room-a" }] }
  const roomA = { ...base("room-a", "rooms"), building: "building-home", floor: 1, occupants: [a.title], private_for: [a.id], connections: [{ target: hall.id }, { target: "room-b" }] }
  const roomB = { ...base("room-b", "rooms"), building: "building-home", floor: 1, occupants: [b.title], private_for: [b.id], connections: [{ target: roomA.id }] }
  const building = {
    ...base("building-home", "buildings"),
    residents: [a.id, b.id],
    rooms: [hall.id, roomA.id, roomB.id],
    map: "map-town",
    layout: {
      cell_m: 0.5,
      width: 10,
      depth: 12,
      floors: [
        { floor: 0, rooms: [hall.id] },
        { floor: 1, rooms: [roomA.id, roomB.id] },
      ],
    },
  }
  return { building, hall, roomA, roomB, documents: new Map<string, SettingDocument>([a, b, hall, roomA, roomB].map((d) => [d.id, d])) }
}
it("rejects a connected house which routes someone through the other person's bedroom", () => {
  const f = fixture()
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual(["resident-b: bedroom route crosses another person's private room or has no entrance"])
})
it("accepts separate bedroom entrances from the shared hall without removing privacy", () => {
  const f = fixture()
  f.hall.connections.push({ target: f.roomB.id })
  f.roomB.connections.push({ target: f.hall.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual([])
})
it("permits crossing a room when both residents explicitly have access", () => {
  const f = fixture()
  f.roomA.private_for.push("resident-b")
  f.roomA.occupants.push("resident-b")
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual([])
})
it("rejects private access assigned to someone outside the room household", () => {
  const f = fixture()
  f.roomA.private_for.push("resident-outsider")
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("room-a: private access belongs to someone outside the room's household")
})
it("does not count a neighbour's exterior door as the resident's entrance", () => {
  const f = fixture()
  f.hall.connections = [{ target: "room-a" }]
  f.documents.set("room-neighbour", { ...base("room-neighbour", "rooms"), building: "building-neighbour", floor: 0, connections: [{ target: "map-town" }, { target: f.roomA.id }] })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("resident-a: bedroom route crosses another person's private room or has no entrance")
})
it("keeps unplanned drafts separate from a passed building's access requirements", () => {
  const f = fixture(),
    draft: SettingDocument = { ...f.building }
  delete draft.layout
  expect(auditPrivateRoomAccess(draft, f.documents)).toEqual([])
  draft.design_gate = "通過"
  expect(auditPrivateRoomAccess(draft, f.documents)).toContain("resident-b: bedroom route crosses another person's private room or has no entrance")
})

it("does not route a guest through the proprietor's private bedroom", () => {
  const f = fixture()
  const guest = { ...base("room-guest", "rooms"), building: f.building.id, floor: 1, guest_capacity: 1, connections: [{ target: f.roomA.id }] }
  f.building.rooms.push(guest.id)
  f.documents.set(guest.id, guest)
  f.roomA.connections.push({ target: guest.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("room-guest: guest route crosses a private bedroom or another guest room or has no entrance")
  f.hall.connections.push({ target: guest.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).not.toContain("room-guest: guest route crosses a private bedroom or another guest room or has no entrance")
})
it("does not use one guest's room as a passage to another guest's room or the household", () => {
  const f = fixture()
  f.hall.connections = [{ target: "map-town" }, { target: "room-guest-a" }]
  const a = { ...base("room-guest-a", "rooms"), building: f.building.id, floor: 1, guest_capacity: 1, connections: [{ target: f.roomA.id }, { target: "room-guest-b" }] }
  const b = { ...base("room-guest-b", "rooms"), building: f.building.id, floor: 1, guest_capacity: 1, connections: [] }
  for (const r of [a, b]) {
    f.building.rooms.push(r.id)
    f.documents.set(r.id, r)
  }
  const errors = auditPrivateRoomAccess(f.building, f.documents)
  expect(errors).toContain("room-guest-b: guest route crosses a private bedroom or another guest room or has no entrance")
  expect(errors).toContain("resident-a: bedroom route crosses another person's private room or has no entrance")
})

it("keeps the assigned sleeper in the private access list even before the building is planned", () => {
  const f = fixture()
  f.roomA.private_for = ["resident-b"]
  f.roomA.occupants.push("resident-b")
  f.documents.get(f.roomA.id)!.sleeping_places = [{ resident: "resident-a" }]
  const draft: SettingDocument = { ...f.building }
  delete draft.layout
  expect(auditPrivateRoomAccess(draft, f.documents)).toContain("room-a: private access excludes assigned resident: resident-a")
})
it("does not lock the owner out of personal storage in a different private room", () => {
  const f = fixture()
  f.documents.get(f.roomA.id)!.personal_storage = [{ resident: "resident-b" }]
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("room-a: private access excludes assigned resident: resident-b")
  f.roomA.private_for.push("resident-b")
  f.roomA.occupants.push("resident-b")
  expect(auditPrivateRoomAccess(f.building, f.documents)).not.toContain("room-a: private access excludes assigned resident: resident-b")
})

it("checks the dining route independently of the route to a resident's own bedroom", () => {
  const f = fixture()
  f.hall.connections.push({ target: f.roomB.id })
  const dining: SettingDocument = {
    ...base("room-dining", "rooms"),
    building: f.building.id,
    floor: 1,
    household_meal: { table: "T", seats: [{ resident: "resident-b", chair: "C" }] },
    connections: [],
  }
  f.documents.set(dining.id, dining)
  f.building.rooms.push(dining.id)
  f.roomA.connections.push({ target: dining.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("resident-b: dining route to room-dining crosses a private or guest room or has no entrance")
  f.hall.connections.push({ target: dining.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual([])
})
it("checks a personal storage room reached through someone else's bedroom", () => {
  const f = fixture()
  f.hall.connections.push({ target: f.roomB.id })
  const store: SettingDocument = { ...base("room-store", "rooms"), building: f.building.id, floor: 1, personal_storage: [{ resident: "resident-b" }], connections: [] }
  f.documents.set(store.id, store)
  f.building.rooms.push(store.id)
  f.roomA.connections.push({ target: store.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("resident-b: personal storage route to room-store crosses a private or guest room or has no entrance")
  f.hall.connections.push({ target: store.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual([])
})
it("does not exclude a diner from the dining room's private access list in a draft", () => {
  const f = fixture()
  f.documents.get(f.roomA.id)!.household_meal = { table: "T", seats: [{ resident: "resident-b", chair: "C" }] }
  const draft: SettingDocument = { ...f.building }
  delete draft.layout
  expect(auditPrivateRoomAccess(draft, f.documents)).toContain("room-a: private access excludes assigned resident: resident-b")
})

it("permits a public records room only for its reciprocally assigned worker", () => {
  const f = fixture(),
    worker = f.documents.get("resident-a")!
  f.building.residents = []
  f.building.rooms = [f.hall.id, f.roomA.id]
  ;(f.building as SettingDocument).workers = [worker.id]
  worker.work_rooms = [f.roomA.id]
  f.documents.set(f.building.id, f.building)
  f.roomA.connections = [{ target: f.hall.id }]
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual([])
  worker.work_rooms = []
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("room-a: private access belongs to someone outside the room's household")
})

it("does not route a public worker through another worker's restricted records room", () => {
  const f = fixture(),
    a = f.documents.get("resident-a")!,
    b = f.documents.get("resident-b")!
  f.building.residents = []
  ;(f.building as SettingDocument).workers = [a.id, b.id]
  a.work_rooms = [f.roomA.id]
  b.work_rooms = [f.roomB.id]
  f.documents.set(f.building.id, f.building)
  expect(auditPrivateRoomAccess(f.building, f.documents)).toContain("resident-b: work route to room-b crosses a private or guest room or has no entrance")
  f.hall.connections.push({ target: f.roomB.id })
  expect(auditPrivateRoomAccess(f.building, f.documents)).toEqual([])
})
