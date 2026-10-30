import { expect, it } from "vitest"
import { roomHasWorker } from "./room-worker"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", design_gate: "未通過", issues: [], source: "test" })
function fixture() {
  const worker = { ...base("resident-a", "residents"), work_rooms: ["room-a"] }
  const room = { ...base("room-a", "rooms"), building: "building-a", occupants: [worker.title] }
  const building = { ...base("building-a", "buildings"), rooms: [room.id], workers: [worker.id] }
  return { worker, room, building, documents: new Map<string, SettingDocument>([worker, room, building].map((d) => [d.id, d])) }
}
it("requires the worker, building and room to acknowledge the same assignment", () => {
  const f = fixture()
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(true)
})
it("rejects a worker assigned to another room or absent from the workplace's inventory", () => {
  const f = fixture()
  f.worker.work_rooms = []
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(false)
  f.worker.work_rooms = [f.room.id]
  f.building.rooms = []
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(false)
})
it("rejects an unrelated person or a room which does not include its assigned worker", () => {
  const f = fixture()
  f.building.workers = []
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(false)
  f.building.workers = [f.worker.id]
  f.room.occupants = []
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(false)
})
it("does not treat a string or a different kind of document as a staff list", () => {
  const f = fixture()
  f.documents.get(f.building.id)!.workers = f.worker.id
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(false)
  f.building.workers = [f.worker.id]
  f.worker.kind = "facilities"
  expect(roomHasWorker(f.room, f.worker.id, f.documents)).toBe(false)
})
