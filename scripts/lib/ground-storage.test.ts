import { expect, it } from "vitest"
import { auditGroundStorage } from "./ground-storage"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const worker = { ...base("resident-worker", "residents"), work_rooms: ["room-store"] }
  const building = { ...base("building-a", "buildings"), map: "map-town", rooms: ["room-store", "room-hall"], workers: [worker.id] }
  const store: SettingDocument = {
    ...base("room-store", "rooms"),
    building: building.id,
    occupants: [worker.title],
    floor: 0,
    grid: { cell_m: 1, rows: ["####", "#B.D", "####"] },
    furniture: [{ symbol: "B", role: "bulk_storage", name: "樽", owner: "店", source: "木工所", rect: [1, 1, 1, 1], access: [[2, 1]] }],
    ground_storage: [{ furniture: "B", contents: "酒樽", handler: "resident-worker" }],
    connections: [{ kind: "door", target: "room-hall" }],
  }
  const hall: SettingDocument = {
    ...base("room-hall", "rooms"),
    building: building.id,
    floor: 0,
    grid: { cell_m: 1, rows: ["####", "D..D", "####"] },
    connections: [{ kind: "door", target: "map-town" }],
  }
  return { building, store, hall, documents: new Map<string, SettingDocument>([worker, building, store, hall, base("map-town", "maps")].map((d) => [d.id, d])) }
}
it("keeps bulk storage connected to the outdoors on the ground floor", () => {
  expect(auditGroundStorage(fixture().documents)).toEqual([])
})
it("does not accept an upstairs store", () => {
  const f = fixture()
  f.store.floor = 1
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage has no ground-floor room in its building")
})
it("does not use stairs as the delivery connection", () => {
  const f = fixture()
  f.store.connections = [{ kind: "stair", target: f.hall.id }]
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
})
it("does not take the load through a private bedroom or a neighbour", () => {
  const f = fixture()
  f.hall.private_for = ["resident-a"]
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
  delete f.hall.private_for
  f.hall.building = "building-other"
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
})
it("requires placed bulk furniture and a unique assignment", () => {
  const f = fixture()
  f.store.furniture![0].role = "bed"
  f.store.ground_storage = [
    { furniture: "B", contents: "酒樽", handler: "resident-worker" },
    { furniture: "B", contents: "酒樽", handler: "resident-worker" },
  ]
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage has no matching bulk furniture and contents")
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage furniture is assigned more than once")
})

it("does not mistake a room reference without a grid for a usable passage", () => {
  const f = fixture()
  delete f.hall.grid
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
})
it("does not accept a blocked hall even though its room graph reaches the outdoors", () => {
  const f = fixture()
  f.hall.grid!.rows[1] = "D##D"
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
})
it("checks the storage footprint rather than just its furniture role", () => {
  const f = fixture()
  f.store.grid!.rows[1] = "#..D"
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage footprint does not match its room grid")
})
it("requires access to the storage itself in addition to the exterior door", () => {
  const f = fixture()
  f.store.grid = { cell_m: 1, rows: ["#######", "#B#..DD", "#######"] }
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
})

it("requires the named handler to work in this building and room", () => {
  const f = fixture()
  f.building.workers = []
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage handler has no matching work assignment")
})

it("rejects a shelf without any handling position even when the room reaches outside", () => {
  const f = fixture()
  f.store.furniture![0].access = []
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage has no handling position")
})

it("allows the assigned handler through a restricted stockroom but never through a sleeping room", () => {
  const f = fixture()
  f.store.private_for = ["resident-worker"]
  f.hall.private_for = ["resident-worker"]
  expect(auditGroundStorage(f.documents)).toEqual([])
  f.hall.bed_capacity = 1
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
  f.hall.bed_capacity = 0
  f.hall.furniture = [{ symbol: "B", name: "寝台", owner: "resident-worker", source: "木工所", rect: [1, 1, 1, 1], access: [[2, 1]], role: "bed" }]
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
})
it("requires a route for every handler instead of borrowing another worker's permission", () => {
  const f = fixture()
  const other: SettingDocument = { ...base("resident-other", "residents"), work_rooms: [f.store.id] }
  f.documents.set(other.id, other)
  f.building.workers.push(other.id)
  f.store.occupants = ["resident-worker", other.title]
  f.hall.private_for = ["resident-worker"]
  f.store.grid = { cell_m: 1, rows: ["#######", "#B.C..D", "#.....#", "#######"] }
  f.store.furniture!.push({ ...f.store.furniture![0], symbol: "C", rect: [3, 1, 1, 1], access: [[4, 1]] })
  f.store.ground_storage = [
    { furniture: "B", contents: "酒樽", handler: "resident-worker" },
    { furniture: "C", contents: "酒樽", handler: other.id },
  ]
  expect(auditGroundStorage(f.documents)).toContain("room-store: Ground storage route needs stairs or a private room, or has no outdoor door")
  f.hall.private_for = ["resident-worker", other.id]
  expect(auditGroundStorage(f.documents)).toEqual([])
})
