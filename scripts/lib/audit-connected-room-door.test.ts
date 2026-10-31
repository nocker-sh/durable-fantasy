import { expect, it } from "vitest"
import { auditConnectedRoomDoor } from "#/scripts/lib/audit-connected-room-door"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Connection } from "#/scripts/lib/building-layout"

function fixture() {
  const room: SettingDocument = {
    id: "west",
    kind: "rooms",
    title: "west",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    floor: 0,
    grid: { cell_m: 1, rows: ["###", "#.D", "###"] },
  }
  const target: SettingDocument = { ...structuredClone(room), id: "east", grid: { cell_m: 1, rows: ["###", "D.#", "###"] } }
  const connection: Connection = { door: [2, 1], target: "east", target_door: [0, 1], width_cells: 1 }
  const reciprocal: Connection = { door: [0, 1], target: "west", target_door: [2, 1], width_cells: 1 }
  return { room, target, origin: [0, 0] satisfies [number, number], targetOrigin: [2, 0] satisfies [number, number], connection, reciprocal }
}
it("matches opposite openings without changing the authored connection", () => {
  const request = fixture(),
    original = structuredClone(request)
  expect(auditConnectedRoomDoor(request)).toEqual([])
  expect(request).toEqual(original)
})
it("rejects coincident openings that face in the same direction", () => {
  const request = fixture()
  request.targetOrigin = [0, 0]
  request.target.grid = structuredClone(request.room.grid)
  request.connection.target_door = [2, 1]
  request.reciprocal.door = [2, 1]
  expect(auditConnectedRoomDoor(request)).toContain("west: connected doorways do not face each other")
})
it("rejects coincident openings with perpendicular wall normals", () => {
  const request = fixture()
  request.targetOrigin = [1, 1]
  request.target.grid = { cell_m: 1, rows: ["#D#", "#.#", "###"] }
  request.connection.target_door = [1, 0]
  request.reciprocal.door = [1, 0]
  expect(auditConnectedRoomDoor(request)).toContain("west: connected doorways do not face each other")
})
it("requires the other doorway to exist in the target grid", () => {
  const request = fixture()
  request.target.grid = { cell_m: 1, rows: ["###", "#.#", "###"] }
  expect(auditConnectedRoomDoor(request)).toContain("west: connected doorways do not face each other")
})
it("rejects different physical cell scales at the same declared doorway", () => {
  const request = fixture()
  request.target.grid = { cell_m: 2, rows: ["###", "D.#", "###"] }
  expect(auditConnectedRoomDoor(request)).toContain("west: connected doorways do not face each other")
})
