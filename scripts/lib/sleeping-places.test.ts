import { expect, it } from "vitest"
import { auditSleepingPlaces } from "./sleeping-places"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const doc = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const resident = { ...doc("resident-a", "residents"), bedroom: "room-a", bed_id: "bed-a" }
  const room = {
    ...doc("room-a", "rooms"),
    building: "building-a",
    bed_capacity: 1,
    occupants: [resident.title],
    sleeping_places: [{ id: "bed-a", resident: resident.id, kind: "個別寝台", grid_symbol: null }],
  }
  const building = { ...doc("building-a", "buildings"), residents: [resident.id] }
  return {
    resident,
    room,
    documents: new Map<string, SettingDocument>([
      [resident.id, resident],
      [room.id, room],
      [building.id, building],
    ]),
  }
}
it("accepts a personal bed and reciprocal resident reference without calling its layout finished", () => {
  expect(auditSleepingPlaces(fixture().documents)).toEqual([])
})
it("does not count guest capacity as a resident's ordinary bed", () => {
  const f = fixture()
  f.room.sleeping_places = []
  f.documents.get(f.room.id)!.guest_capacity = 1
  expect(auditSleepingPlaces(f.documents)).toContain("resident-a: needs exactly one ordinary bed")
})
it("rejects inconsistent resident references and overfilled rooms", () => {
  const f = fixture()
  f.resident.bed_id = "other-bed"
  f.room.bed_capacity = 2
  expect(auditSleepingPlaces(f.documents)).toContain("resident-a: bedroom and bed references disagree")
  expect(auditSleepingPlaces(f.documents)).toContain("room-a: sleeping capacity does not match assignments and guest slots")
})
it("rejects a bed assigned to someone outside the building household", () => {
  const f = fixture()
  f.documents.get("building-a")!.residents = []
  expect(auditSleepingPlaces(f.documents)).toContain("room-a: occupant does not live in this building")
})
it("requires a physical bed and matching owner before room design can pass", () => {
  const f = fixture()
  f.room.design_gate = "通過"
  expect(auditSleepingPlaces(f.documents)).toContain("room-a: bed has no designed grid footprint")
})
it("rejects duplicated bed IDs and residents with multiple ordinary beds", () => {
  const f = fixture()
  f.room.sleeping_places.push({ ...f.room.sleeping_places[0] })
  f.room.bed_capacity = 2
  expect(auditSleepingPlaces(f.documents)).toContain("room-a: duplicate or missing bed ID")
  expect(auditSleepingPlaces(f.documents)).toContain("resident-a: needs exactly one ordinary bed")
})
it("does not treat a shared rest surface as an individual's ordinary bed", () => {
  const f = fixture()
  f.room.sleeping_places[0].kind = "共用の長椅子"
  expect(auditSleepingPlaces(f.documents)).toContain("room-a: ordinary bed must be an individual sleeping place")
})
it("checks zero-capacity rooms instead of overlooking hidden bed or guest assignments", () => {
  const f = fixture()
  f.documents.set("room-other", { ...doc("room-other", "rooms"), building: "building-a", occupants: [], bed_capacity: 0, guest_capacity: 1 })
  expect(auditSleepingPlaces(f.documents)).toContain("room-other: sleeping capacity does not match assignments and guest slots")
  f.documents.get("room-other")!.guest_capacity = 0
  f.documents.get("room-other")!.sleeping_places = [{ ...f.room.sleeping_places[0] }]
  expect(auditSleepingPlaces(f.documents)).toContain("room-other: sleeping capacity does not match assignments and guest slots")
  expect(auditSleepingPlaces(f.documents)).toContain("resident-a: needs exactly one ordinary bed")
})
it("allows an ordinary room with no sleeping assignment", () => {
  const f = fixture()
  f.documents.set("room-kitchen", { ...doc("room-kitchen", "rooms"), bed_capacity: 0 })
  expect(auditSleepingPlaces(f.documents)).toEqual([])
})
function furnishedBed(rect: number[], cell_m = 0.5) {
  const f = fixture(),
    room = f.documents.get(f.room.id)!
  room.grid = { cell_m, rows: ["######", "#BB..#", "#BB..#", "#BB..#", "#BB..#", "##DD##"] }
  room.furniture = [{ symbol: "B", role: "bed", name: "寝台", owner: f.resident.title, source: "大工", rect, access: [[3, 2]] }]
  room.sleeping_places = [{ id: "bed-a", resident: f.resident.id, kind: "個別寝台", grid_symbol: "B" }]
  return f.documents
}
it("checks actual bed dimensions in metres in both orientations", () => {
  expect(auditSleepingPlaces(furnishedBed([1, 1, 2, 4]))).toEqual([])
  expect(auditSleepingPlaces(furnishedBed([1, 1, 4, 2]))).toEqual([])
  expect(auditSleepingPlaces(furnishedBed([1, 1, 4, 8], 0.25))).toEqual([])
})
it("does not accept a short or narrow object just because its symbol is assigned to a bed", () => {
  expect(auditSleepingPlaces(furnishedBed([1, 1, 2, 2]))).toContain("room-a: assigned bed is too small")
  expect(auditSleepingPlaces(furnishedBed([1, 1, 1, 4]))).toContain("room-a: assigned bed is too small")
  expect(auditSleepingPlaces(furnishedBed([1, 1, 2, 4], 0.25))).toContain("room-a: assigned bed is too small")
})

it("does not turn an owner's cupboard into a bed by assigning its symbol", () => {
  const documents = furnishedBed([1, 1, 2, 4])
  documents.get("room-a")!.furniture![0].role = "storage"
  expect(auditSleepingPlaces(documents)).toContain("room-a: sleeping assignment must use bed furniture")
})
it("requires every ordinary sleeper to be placed once a room has a grid, even in draft", () => {
  const documents = furnishedBed([1, 1, 2, 4]),
    room = documents.get("room-a")!
  room.sleeping_places = [{ id: "bed-a", resident: "resident-a", kind: "個別寝台", grid_symbol: null }]
  expect(auditSleepingPlaces(documents)).toContain("room-a: bed has no designed grid footprint")
  expect(auditSleepingPlaces(documents)).toContain("room-a: bed furniture has no sleeping assignment")
})

it("updates the selected room and its declared candidates together when a sleeper moves", () => {
  const f = fixture(),
    resident = f.documents.get(f.resident.id)!
  resident.bedroom_candidates = ["room-other"]
  expect(auditSleepingPlaces(f.documents)).toContain("resident-a: bedroom candidates do not include one consistent selected bedroom")
  resident.bedroom_candidates = [f.room.id, f.room.id]
  expect(auditSleepingPlaces(f.documents)).toContain("resident-a: bedroom candidates do not include one consistent selected bedroom")
  resident.bedroom_candidates = [f.room.id]
  expect(auditSleepingPlaces(f.documents)).toEqual([])
})

it("does not register a worker as living in a second building without a bed there", () => {
  const f = fixture()
  const workshop: SettingDocument = { id: "building-workshop", kind: "buildings", title: "仕事場", source: "test", status: "設計中", design_gate: "未通過", issues: [], residents: [f.resident.id] }
  f.documents.set(workshop.id, workshop)
  expect(auditSleepingPlaces(f.documents)).toContain("building-workshop: resident has no ordinary bed in this building: resident-a")
  workshop.residents = []
  workshop.workers = [f.resident.id]
  expect(auditSleepingPlaces(f.documents)).toEqual([])
})
