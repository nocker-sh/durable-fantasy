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

it("rejects a connection whose local coordinates match a room in another building", () => {
  const request = fixture()
  request.a.grid.rows[0] = "#D#"
  const foreign = {
    ...request.b,
    id: "room-foreign",
    building: "building-other",
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["#D#", "#.#", "###"] },
    connections: [{ door: [1, 0], target: request.a.id, target_door: [1, 0], width_cells: 1 }],
  }
  request.documents.set(foreign.id, foreign)
  request.a.connections.push({ door: [1, 0], target: foreign.id, target_door: [1, 0], width_cells: 1 })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: connection to room-foreign uses another building frame")
})

it("rejects an unplaced room even when it claims the same building and matching doorway", () => {
  const request = fixture()
  request.a.grid.rows[0] = "#D#"
  const unplaced = {
    ...request.b,
    id: "room-unplaced",
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["#D#", "#.#", "###"] },
    connections: [{ door: [1, 0], target: request.a.id, target_door: [1, 0], width_cells: 1 }],
  }
  request.documents.set(unplaced.id, unplaced)
  request.a.connections.push({ door: [1, 0], target: unplaced.id, target_door: [1, 0], width_cells: 1 })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: connection to room-unplaced is outside the building inventory")
})

it("rejects missing destinations and documents that are neither maps nor rooms", () => {
  const request = fixture()
  request.a.grid.rows[0] = "#D#"
  request.a.connections.push({ door: [1, 0], target: "room-absent", target_door: [1, 0], width_cells: 1 })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: connection target room-absent is missing")
  request.documents.set("room-absent", base("room-absent", "residents"))
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: connection target room-absent is not a room or map")
})

it("does not treat an indoor stair connection as an exterior map doorway", () => {
  const request = fixture()
  Object.assign(request.a.connections[1], { kind: "stair" })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: stair connection target is not a room")
})

it("bounds invalid doorway scans by the real room grid", () => {
  const request = fixture()
  const reads = { count: 0 }
  request.a.grid.rows = new Proxy(request.a.grid.rows, {
    get(rows, key, receiver) {
      if (typeof key === "string" && Number.isSafeInteger(Number(key))) {
        reads.count++
        if (reads.count > 100) throw new Error("Doorway scan exceeded grid budget")
      }
      return Reflect.get(rows, key, receiver)
    },
  })
  request.a.connections[0].width_cells = Number.MAX_SAFE_INTEGER
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: doorway footprint disagrees with grid")
})

it.each([{ floors: [null] }, { floors: [{ floor: 0, rooms: null }] }, { floors: [{ floor: 0, rooms: [null] }] }, { floors: [{ rooms: [] }] }])(
  "reports malformed floor metadata instead of crashing the spatial audit: %j",
  (layout) => {
    const request = fixture()
    Object.assign(request.building.layout, layout)
    expect(auditBuildingLayout(request.building, request.documents)).toContain("Invalid building dimensions")
  },
)

it.each([null, undefined, [null], "room-a"])("rejects an invalid building room inventory: %j", (rooms) => {
  const request = fixture()
  Object.assign(request.building, { rooms })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("Invalid building room inventory")
})

it("rejects dimensions whose cell count cannot be represented exactly", () => {
  const request = fixture()
  request.building.layout.width = Number.MAX_SAFE_INTEGER
  request.building.layout.depth = 2
  expect(auditBuildingLayout(request.building, request.documents)).toContain("Invalid building dimensions")
})

it("rejects finite cell dimensions that overflow when converted to physical metres", () => {
  const request = fixture()
  request.building.layout.cell_m = Number.MAX_VALUE
  expect(auditBuildingLayout(request.building, request.documents)).toContain("Invalid building dimensions")
})

it("keeps door ownership errors when building dimensions are invalid", () => {
  const request = fixture()
  Object.assign(request.building, { door_leaf_inventory: "invalid" })
  request.building.layout.width = 0
  expect(auditBuildingLayout(request.building, request.documents)).toEqual(["Invalid building door inventory", "Invalid building dimensions"])
})

it.each([0, false, ""])("does not confuse an invalid layout with an undesigned layout: %j", (layout) => {
  const request = fixture()
  Object.assign(request.building, { layout })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("Invalid building dimensions")
})

it.each([null, undefined])("retains the explicit absence of a layout for undesigned buildings: %j", (layout) => {
  const request = fixture()
  Object.assign(request.building, { layout })
  expect(auditBuildingLayout(request.building, request.documents)).toEqual([])
})

it("does not rewrite authored metadata while validating the layout", () => {
  const request = fixture()
  Object.assign(request.building.layout, { notes: { owner: "test-household" } })
  const original = structuredClone(request)
  expect(auditBuildingLayout(request.building, request.documents)).toEqual([])
  expect(request).toEqual(original)
})

it.each([
  { cell_m: 1, rows: null },
  { cell_m: 1, rows: [null] },
  { cell_m: 1, rows: ["###", "##"] },
  { cell_m: 1, rows: [] },
  { cell_m: 1, rows: [""] },
])("reports a malformed room grid without crashing: %j", (grid) => {
  const request = fixture()
  Object.assign(request.a, { grid })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: invalid room grid")
})

it("does not accept another document kind as an interior room", () => {
  const request = fixture()
  request.a.kind = "residents"
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: missing grid or wrong building/floor")
})

it.each([{}, "invalid", [null], [{ target: null }], [{ target: "room-b", door: "invalid" }]])("rejects malformed connections without crashing: %j", (connections) => {
  const request = fixture()
  Object.assign(request.a, { connections })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: invalid room connections")
})

it.each([null, undefined])("reports orphaned doors when the connection list is absent: %j", (connections) => {
  const request = fixture()
  Object.assign(request.a, { connections })
  const errors = auditBuildingLayout(request.building, request.documents)
  expect(errors).not.toContain("room-a: invalid room connections")
  expect(errors).toContain("room-a: doorway cell has no connection at 0,1")
})

it("does not count displaced reciprocal doors as a route outside", () => {
  const request = fixture()
  request.b.origin = [3, 0]
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-b: no route to the building's exterior")
})

it("does not count mismatched connection kinds as a route outside", () => {
  const request = fixture()
  Object.assign(request.b.connections[0], { kind: "opening" })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-b: no route to the building's exterior")
})

it("requires a real doorway on both ends of an exterior route", () => {
  const request = fixture()
  request.b.grid.rows[1] = "#.#"
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-b: no route to the building's exterior")
})

it("does not seed an exterior route from a connection drawn through a solid wall", () => {
  const request = fixture()
  request.a.grid.rows[1] = "#.D"
  const errors = auditBuildingLayout(request.building, request.documents)
  expect(errors).toContain("room-a: no route to the building's exterior")
  expect(errors).toContain("room-b: no route to the building's exterior")
})

it("does not seed an exterior route from a stair targeting an outdoor map", () => {
  const request = fixture()
  Object.assign(request.a.connections[1], { kind: "stair" })
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-a: no route to the building's exterior")
})

it("does not count coincident doorways facing the same direction as a passage", () => {
  const request = fixture()
  request.b.origin = [0, 0]
  request.b.grid.rows[1] = "#.D"
  request.a.connections[0].target_door = [2, 1]
  request.b.connections[0].door = [2, 1]
  expect(auditBuildingLayout(request.building, request.documents)).toContain("room-b: no route to the building's exterior")
})
