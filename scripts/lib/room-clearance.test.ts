import { expect, it } from "vitest"
import { auditRoomClearance } from "#/scripts/lib/room-clearance"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function room(opening = "####..####"): SettingDocument {
  return {
    id: "room-a",
    kind: "rooms",
    title: "部屋",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    grid: { cell_m: 0.5, rows: ["##########", "#A.......#", "#........#", opening, "#........#", "#........#", "####DD####"] },
    furniture: [{ symbol: "A", name: "収納", owner: "住民", source: "大工", rect: [1, 1, 1, 1], access: [[2, 1]] }],
  }
}
it("reaches furniture through a passage wide enough for the design footprint", () => {
  expect(auditRoomClearance(room())).toEqual([])
})
it("rejects a half-metre bottleneck even when a point can reach the furniture", () => {
  const doc = room("####.#####")
  expect(auditRoomGrid(doc)).toEqual([])
  expect(auditRoomClearance(doc)).toContain("A: insufficient clearance to use position")
})
it("requires all doorways to connect with clearance instead of seeding separate compartments", () => {
  const doc = room("####.#####")
  doc.grid!.rows[0] = "####DD####"
  expect(auditRoomClearance(doc)).toContain("Insufficient clearance to entry at 4,6")
})
it("uses the declared stair endpoint when the room has no doorway", () => {
  const doc = room()
  doc.grid!.rows[6] = "##########"
  doc.grid!.rows[4] = "#..S.....#"
  doc.furniture!.push({ symbol: "S", name: "階段", owner: "住民", source: "大工", rect: [3, 4, 1, 1], access: [[4, 4]] })
  doc.connections = [{ kind: "stair", furniture: "S", access: [4, 4], target: "room-lower" }]
  expect(auditRoomGrid(doc)).toEqual([])
  expect(auditRoomClearance(doc)).toEqual([])
  doc.grid!.rows[3] = "####.#####"
  expect(auditRoomClearance(doc)).toContain("A: insufficient clearance to use position")
})
it("keeps the same physical passage valid when the author uses a finer grid", () => {
  const doc = room()
  doc.grid!.rows = doc.grid!.rows.flatMap((row) => {
    const expanded = [...row].map((cell) => cell.repeat(2)).join("")
    return [expanded, expanded]
  })
  doc.grid!.cell_m = 0.25
  doc.furniture![0].rect = [2, 2, 2, 2]
  doc.furniture![0].access = [[4, 2]]
  expect(auditRoomGrid(doc)).toEqual([])
  expect(auditRoomClearance(doc)).toEqual([])
})
it("converts the body width to the room's scale", () => {
  const doc = room("####.#####")
  doc.grid!.cell_m = 1
  expect(auditRoomClearance(doc)).toEqual([])
})
it("does not invent an entrance for an isolated room", () => {
  const doc = room()
  doc.grid!.rows[6] = "##########"
  expect(auditRoomClearance(doc)).toEqual(["Clearance has no doorway or stair entry"])
})
