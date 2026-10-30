import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { roomDoorSwings } from "#/scripts/lib/room-door-swings"
import { auditPairedDoorOperation } from "#/scripts/lib/audit-paired-door-operation"
import type { PairedDoorSequence } from "#/scripts/lib/audit-paired-door-operation"
function fixture() {
  const rows: string[] = Array.from({ length: 16 }, (_, y) => (y === 0 ? "################" : y === 15 ? "######DDDD######" : "#..............#"))
  const document: SettingDocument = {
    id: "room-a",
    kind: "rooms",
    title: "工房",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    grid: { cell_m: 0.5, rows },
    connections: [{ door: [6, 15], width_cells: 4, target: "map-town" }],
  }
  const swings = roomDoorSwings(document, { door: [6, 15], hinge: "start", paired: true, meeting_gap_m: 0.01, frame_inset_m: 0.05, thickness_m: 0.04, waits_for: [] })
  const op = { body_radius_m: 0.4, orbit_radius_m: 1.4, start_deg: 20, end_deg: 70 }
  const point = (hinge: number, angle: number, sign: number) => [hinge + sign * 1.4 * Math.cos((angle * Math.PI) / 180), 7.5 - 1.4 * Math.sin((angle * Math.PI) / 180)]
  const sequence: PairedDoorSequence = { first: "start", start: { ...op }, end: { ...op }, transfer_points_m: [point(3.05, 70, 1), point(4.95, 20, -1)] }
  return { swings, sequence, rows, audit: () => auditPairedDoorOperation({ swings: swings, sequence: sequence, rows: rows, scale: 0.5 }), point }
}
it("opens the leaves in sequence and connects both handle arcs", () => {
  expect(fixture().audit()).toEqual([])
})
it("supports opening the opposite leaf first", () => {
  const f = fixture()
  f.sequence.first = "end"
  f.sequence.transfer_points_m = [f.point(4.95, 70, -1), f.point(3.05, 20, 1)]
  expect(f.audit()).toEqual([])
})
it("keeps the still-closed panel in the first operator's obstacles", () => {
  const f = fixture()
  f.sequence.start.start_deg = 0
  expect(f.audit()).toContain("operator path hits the stationary panel")
})
it("checks the whole walk between handles, including the held-open panel", () => {
  const f = fixture()
  f.sequence.transfer_points_m.splice(1, 0, [3.05, 6.8])
  expect(f.audit()).toContain("handle transfer hits an obstacle")
})
it("rejects a walk that does not actually join the handle arcs", () => {
  const f = fixture()
  f.sequence.transfer_points_m[0][0] += 0.1
  expect(f.audit()).toContain("handle transfer does not join the operating arcs")
})
it("does not shrink the person between panels", () => {
  const f = fixture()
  f.sequence.end.body_radius_m = 0.3
  expect(f.audit()).toContain("paired operation changes the operator's body size")
})
it("requires physical panels and checks room furniture during each arc", () => {
  const f = fixture()
  f.rows[12] = "#......A.......#"
  expect(f.audit()).toContain("start leaf: operator path hits A")
  f.swings[0].thickness_m = undefined
  expect(f.audit()).toEqual(["paired operation needs two designed panels"])
})

it("detects the panel corners colliding when the meeting edges have no clearance", () => {
  const f = fixture()
  // Restore the missing half-gap on each leaf while retaining the same jambs.
  for (const swing of f.swings) {
    swing.radius += 0.005
    swing.open_tip[1] -= 0.005
  }
  expect(f.audit()).toContain("moving panel hits the stationary panel")
})
