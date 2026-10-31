import { expect, it } from "vitest"
import { auditDoorSwings } from "#/scripts/lib/audit-door-swings"
import { roomDoorSwing } from "#/scripts/lib/room-door-swing"
import { roomDoorSwings } from "#/scripts/lib/room-door-swings"
import { swingHitsRect } from "#/scripts/lib/swing-hits-rect"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const leaf = { door: [3, 7], hinge: "end" as "start" | "end", waits_for: [{ furniture: "S", space_index: 0 }] }
  const document: SettingDocument = {
    id: "room-a",
    kind: "rooms",
    title: "部屋",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    grid: { cell_m: 0.5, rows: ["########", "#......#", "#......#", "#......#", "#A.....#", "#SS....#", "#SS....#", "###DD###"] },
    connections: [{ kind: "door", door: [3, 7], width_cells: 2, target: "map-town" }],
    furniture: [
      { symbol: "A", name: "箱", owner: "住民", source: "大工", rect: [1, 4, 1, 1], access: [[2, 4]], use_space: [{ activity: "箱を開く", rect: [2, 3, 2, 2] }] },
      { symbol: "S", name: "階段", owner: "世帯", source: "大工", rect: [1, 5, 2, 2], access: [[3, 6]], use_space: [{ activity: "階段へ出入りする", rect: [3, 5, 2, 2] }] },
    ],
    door_leaves: [leaf],
  }
  return { document, leaf }
}
it("derives the hinge and fully open end from the wall's inner face", () => {
  const f = fixture(),
    swing = roomDoorSwing(f.document, f.leaf)!
  expect(swing.hinge).toEqual([2.5, 3.5])
  expect(swing.open_tip).toEqual([2.5, 2.5])
  f.leaf.hinge = "start"
  expect(roomDoorSwing(f.document, f.leaf)!.open_tip).toEqual([1.5, 2.5])
})
it("checks the whole curved sweep without treating its bounding-box corner as occupied", () => {
  const swing = { hinge: [0, 0], radius: 1, bounds: [0, 0, 1, 1] as [number, number, number, number], open_tip: [0, 1] }
  expect(swingHitsRect(swing, [0.5, 0.5, 0.1, 0.1])).toBe(true)
  expect(swingHitsRect(swing, [0.8, 0.8, 0.1, 0.1])).toBe(false)
  expect(swingHitsRect(swing, [1, 0, 1, 1])).toBe(false)
})
it("accepts sequential use of an overlapping operating area", () => {
  expect(auditDoorSwings(fixture().document)).toEqual([])
})
it("requires an explicit sequence when opening the door shares a person's operating area", () => {
  const f = fixture()
  f.leaf.waits_for = []
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: unsequenced operating space S/0")
})
it("does not use sequencing to excuse hitting the furniture itself", () => {
  const f = fixture()
  f.document.furniture![0].rect = [3, 5, 1, 1]
  f.document.grid!.rows[5] = "#SSA...#"
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: swing hits A")
})
it("rejects an sequence that does not refer to a real overlapping operation", () => {
  const f = fixture()
  f.leaf.waits_for.push({ furniture: "A", space_index: 0 })
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: sequence has no overlapping operating space")
})
it("requires a matching door instead of placing a leaf on an opening or arbitrary cell", () => {
  const f = fixture()
  f.leaf.door = [3, 3]
  expect(auditDoorSwings(f.document)).toContain("Door 3,3: no matching boundary door")
})
it("subtracts the frame from the aperture before locating the hinge and leaf", () => {
  const f = fixture(),
    leaf = { ...f.leaf, frame_inset_m: 0.05, thickness_m: 0.04 },
    swing = roomDoorSwing(f.document, leaf)!
  expect(swing.hinge[0]).toBeCloseTo(2.45)
  expect(swing.radius).toBeCloseTo(0.9)
  expect(swing.thickness_m).toBe(0.04)
})
it("requires enough width after both the frame and open leaf are accounted for", () => {
  const f = fixture()
  f.document.door_leaves = [{ ...f.leaf, frame_inset_m: 0.1, thickness_m: 0.04 }]
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: frame and open leaf leave insufficient width")
})
it("splits a paired opening between opposite hinges rather than doubling its sweep", () => {
  const f = fixture()
  f.document.grid = { cell_m: 0.5, rows: ["########", "#......#", "#......#", "#......#", "#......#", "#......#", "#......#", "##DDDD##"] }
  f.document.connections = [{ kind: "door", door: [2, 7], width_cells: 4, target: "map-town" }]
  const leaf = { door: [2, 7], hinge: "start" as const, paired: true, frame_inset_m: 0.05, thickness_m: 0.04, waits_for: [] }
  const swings = roomDoorSwings(f.document, leaf)
  expect(swings).toHaveLength(2)
  expect(swings[0].hinge).toEqual([1.05, 3.5])
  expect(swings[1].hinge[0]).toBeCloseTo(2.95)
  expect(swings[0].radius).toBeCloseTo(0.95)
  expect(swings[1].radius).toBeCloseTo(0.95)
  expect(swings[0].open_tip[1]).toBeCloseTo(2.55)
  f.document.furniture = []
  f.document.door_leaves = [leaf]
  expect(auditDoorSwings(f.document)).toEqual([])
  f.document.grid.rows[6] = "##A....#"
  expect(auditDoorSwings(f.document)).toContain("Door 2,7: swing hits A")
  f.document.grid.rows[6] = "#....B.#"
  expect(auditDoorSwings(f.document)).toContain("Door 2,7: swing hits B")
})
it("counts both open leaves against the clear passage width", () => {
  const f = fixture()
  f.document.door_leaves = [{ ...f.leaf, paired: true, frame_inset_m: 0.05, thickness_m: 0.06 }]
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: frame and open leaf leave insufficient width")
})
it("does not certify a pair's operating sequence with one person's arc", () => {
  const f = fixture()
  f.document.door_leaves = [{ ...f.leaf, paired: true, operation: { body_radius_m: 0.4, orbit_radius_m: 1.5, start_deg: 20, end_deg: 70 } }]
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: a shared operator arc cannot describe two leaves")
  f.document.design_gate = "通過"
  expect(auditDoorSwings(f.document)).toContain("Door 3,7: paired leaf operating sequence is not designed")
})
it.each([
  { door: [2, 0], width: 8, height: 8, inward: [0, 1] },
  { door: [2, 7], width: 8, height: 8, inward: [0, -1] },
  { door: [0, 2], width: 8, height: 8, inward: [1, 0] },
  { door: [7, 2], width: 8, height: 8, inward: [-1, 0] },
])("keeps paired hinges on opposite jambs for boundary $door", ({ door, width, height, inward }) => {
  const f = fixture()
  f.document.grid = { cell_m: 0.5, rows: Array.from({ length: height }, () => ".".repeat(width)) }
  f.document.connections = [{ kind: "door", door, width_cells: 4, target: "map-town" }]
  const swings = roomDoorSwings(f.document, { door, hinge: "end", paired: true, frame_inset_m: 0.05, waits_for: [] })
  expect(Math.hypot(swings[1].hinge[0] - swings[0].hinge[0], swings[1].hinge[1] - swings[0].hinge[1])).toBeCloseTo(1.9)
  for (const swing of swings) for (let axis = 0; axis < 2; axis++) expect(swing.open_tip[axis] - swing.hinge[axis]).toBeCloseTo(inward[axis] * 0.95)
})

it("places a recessed leaf at the inner face of a thick wall and checks the full passage", () => {
  const f = fixture()
  f.document.grid!.rows = ["########", "#......#", "#......#", "#......#", "#......#", "###..###", "###..###", "###DD###"]
  const leaf = { ...f.leaf, wall_depth_cells: 3 }
  const swing = roomDoorSwing(f.document, leaf)!
  expect(swing.hinge).toEqual([2.5, 2.5])
  expect(swing.open_tip).toEqual([2.5, 1.5])
  f.document.grid!.rows[6] = "####.###"
  expect(roomDoorSwing(f.document, leaf)).toBeUndefined()
})
it("does not allow a recess to shift the leaf beyond the room", () => {
  const f = fixture()
  for (const depth of [0, -1, 1.5, 8, Infinity]) expect(roomDoorSwing(f.document, { ...f.leaf, wall_depth_cells: depth })).toBeUndefined()
})

it("recesses top and side doors along their own inward normal", () => {
  const f = fixture()
  f.document.grid!.rows = ["###DD###", "###..###", "###..###", "#......#", "#......#", "#......#", "#......#", "########"]
  f.document.connections = [{ door: [3, 0], width_cells: 2, target: "map-town" }]
  expect(roomDoorSwing(f.document, { ...f.leaf, door: [3, 0], wall_depth_cells: 3 })!.hinge).toEqual([2.5, 1.5])
  f.document.grid!.rows = ["########", "#......#", "#......#", "D......#", "D......#", "#......#", "#......#", "########"]
  f.document.connections = [{ door: [0, 3], width_cells: 2, target: "map-town" }]
  expect(roomDoorSwing(f.document, { ...f.leaf, door: [0, 3], wall_depth_cells: 3 })!.hinge).toEqual([1.5, 2.5])
  f.document.grid!.rows[3] = "#......D"
  f.document.grid!.rows[4] = "#......D"
  f.document.connections = [{ door: [7, 3], width_cells: 2, target: "map-town" }]
  expect(roomDoorSwing(f.document, { ...f.leaf, door: [7, 3], wall_depth_cells: 3 })!.hinge).toEqual([2.5, 2.5])
})

it("rejects ambiguous connection widths rather than taking the first declaration", () => {
  const f = fixture()
  f.document.connections = [
    { kind: "door", door: [3, 7], width_cells: 2, target: "map-town" },
    { kind: "door", door: [3, 7], width_cells: 1, target: "map-town" },
  ]
  expect(roomDoorSwing(f.document, f.leaf)).toBeUndefined()
})
it.each([{}, "door", [null]])("rejects malformed connection inventories without throwing: %j", (connections) => {
  const f = fixture()
  f.document.connections = connections
  expect(roomDoorSwing(f.document, f.leaf)).toBeUndefined()
})
