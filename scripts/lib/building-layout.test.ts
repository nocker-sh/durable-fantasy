import { auditBuildingEnvelope } from "#/scripts/lib/audit-building-envelope"
import { expect, it } from "vitest"
import { auditBuildingLayout } from "#/scripts/lib/audit-building-layout"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const a = {
    ...base("room-a", "rooms"),
    building: "building-test",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["###", "D.D", "###"] },
    furniture: [],
    connections: [
      { door: [2, 1], target: "room-b", target_door: [0, 1], width_cells: 1 },
      { door: [0, 1], target: "map-outside", target_door: [0, 0], width_cells: 1 },
    ],
  }
  const b = {
    ...base("room-b", "rooms"),
    building: "building-test",
    floor: 0,
    origin: [2, 0],
    grid: { cell_m: 1, rows: ["###", "D.#", "###"] },
    furniture: [],
    connections: [{ door: [0, 1], target: "room-a", target_door: [2, 1], width_cells: 1 }],
  }
  const building = { ...base("building-test", "buildings"), map: "map-outside", rooms: [a.id, b.id], layout: { cell_m: 1, width: 5, depth: 3, floors: [{ floor: 0, rooms: [a.id, b.id] }] } }
  return {
    a,
    b,
    building,
    documents: new Map<string, SettingDocument>([
      [a.id, a],
      [b.id, b],
      ["map-outside", { ...base("map-outside", "maps"), map_kind: "town" }],
    ]),
  }
}
it("accepts rooms that share their wall and the same doorway", () => {
  const f = fixture()
  expect(auditBuildingLayout(f.building, f.documents)).toEqual([])
})
it("detects a door that is valid locally but opens into a different building cell", () => {
  const f = fixture()
  f.b.origin = [3, 0]
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: connected doors do not meet")
})
it("detects conflicting room occupancy even when both local room grids are valid", () => {
  const f = fixture()
  f.b.origin = [1, 0]
  expect(auditBuildingLayout(f.building, f.documents).some((s) => s.includes("conflicting room overlap"))).toBe(true)
})
it("requires the target room to acknowledge the same connection", () => {
  const f = fixture()
  f.b.connections = []
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: connection to room-b is not reciprocal")
})
it("detects missing coverage and omitted rooms", () => {
  const f = fixture()
  f.building.layout.floors[0].rooms = [f.a.id]
  expect(auditBuildingLayout(f.building, f.documents)).toContain("Floor 0: unassigned building cells")
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-b: not placed on a floor")
})
it("requires the doorway footprint to match its declared width", () => {
  const f = fixture()
  f.a.connections[0].width_cells = 2
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: doorway footprint disagrees with grid")
})

it("aligns staircase footprints and endpoints on adjacent floors, rejecting shifted upper openings", () => {
  const lower: SettingDocument = {
    ...base("room-lower", "rooms"),
    building: "building-stair",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["####", "#S.#", "#..D", "####"] },
    furniture: [{ symbol: "S", name: "階段", owner: "家族", source: "大工", rect: [1, 1, 1, 1], access: [[2, 1]] }],
    connections: [
      { kind: "stair", furniture: "S", target: "room-upper", target_furniture: "S", access: [2, 1], target_access: [2, 1] },
      { door: [3, 2], target: "map-outside", width_cells: 1 },
    ],
  }
  const upper: SettingDocument = {
    ...structuredClone(lower),
    id: "room-upper",
    floor: 1,
    grid: { cell_m: 1, rows: ["####", "#S.#", "#..#", "####"] },
    connections: [{ kind: "stair", furniture: "S", target: "room-lower", target_furniture: "S", access: [2, 1], target_access: [2, 1] }],
  }
  const building = {
    ...base("building-stair", "buildings"),
    map: "map-outside",
    rooms: [lower.id, upper.id],
    layout: {
      cell_m: 1,
      width: 4,
      depth: 4,
      floors: [
        { floor: 0, rooms: [lower.id] },
        { floor: 1, rooms: [upper.id] },
      ],
    },
  }
  const docs = new Map([
    [lower.id, lower],
    [upper.id, upper],
    ["map-outside", { ...base("map-outside", "maps"), map_kind: "town" }],
  ])
  expect(auditBuildingLayout(building, docs)).toEqual([])
  upper.furniture![0].rect[0] = 2
  expect(auditBuildingLayout(building, docs)).toContain("room-lower: stairs do not align between adjacent floors")
})

it("rejects a closed group of rooms even when every local doorway has a reciprocal connection", () => {
  const f = fixture()
  f.a.connections = f.a.connections.filter((c) => c.target !== "map-outside")
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: no route to the building's exterior")
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-b: no route to the building's exterior")
})
it("rejects a room disconnected from the exit despite having an assigned position on a floor", () => {
  const f = fixture()
  f.a.connections = f.a.connections.filter((c) => c.target !== f.b.id)
  f.b.connections = []
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-b: no route to the building's exterior")
})
it("does not call another indoor map an exterior exit", () => {
  const f = fixture()
  f.documents.get("map-outside")!.map_kind = "indoor"
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: exterior door does not reach the building's outside map")
})
it("does not permit a missing stair to be replaced by a direct upper-floor exit to the ground map", () => {
  const f = fixture()
  f.a.floor = 1
  f.b.floor = 1
  f.building.layout.floors[0].floor = 1
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: exterior door does not reach the building's outside map")
})
it("does not describe the same boundary as a door on one side and an open passage on the other", () => {
  const f = fixture()
  Object.assign(f.b.connections[0], { kind: "opening" })
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: connection kinds disagree")
})

it("rejects a drawn door that has no destination", () => {
  const f = fixture()
  f.b.grid.rows[1] = "D.D"
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-b: doorway cell has no connection at 2,1")
})
it("does not assign one doorway cell to different destinations", () => {
  const f = fixture()
  f.a.connections.push({ ...f.a.connections[0] })
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-a: doorway cell has multiple connections")
})
it("does not turn an interior floor cell into a room-boundary door", () => {
  const f = fixture()
  f.b.connections[0].door = [1, 1]
  f.b.grid.rows[1] = "DD#"
  expect(auditBuildingLayout(f.building, f.documents)).toContain("room-b: doorway is not on the room boundary")
})

it("matches a partial interior to its exterior without rounding away a different footprint", async () => {
  const building = { ...base("building-chapel", "buildings"), layout_scope: "main-body", layout: { cell_m: 0.14, width: 70, depth: 40, floors: [] } }
  const envelope = { width_m: 9.8, depth_m: 5.6, scope: "main-body" }
  expect(auditBuildingEnvelope(building, envelope)).toEqual([])
  building.layout.width = 69
  expect(auditBuildingEnvelope(building, envelope)).toContain("Layout dimensions do not match the exterior definition")
  building.layout.width = 40
  building.layout.depth = 70
  expect(auditBuildingEnvelope(building, envelope)).toContain("Layout dimensions do not match the exterior definition")
  building.layout_scope = "whole-building"
  expect(auditBuildingEnvelope(building, envelope)).toContain("Layout scope does not match the exterior definition")
})
