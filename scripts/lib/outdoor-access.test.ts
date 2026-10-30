import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditOutdoorAccess } from "#/scripts/lib/audit-outdoor-access"
import type { OutdoorObstacle } from "#/scripts/lib/outdoor-access"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const room = { ...base("room-a", "rooms"), building: "building-a", floor: 0, origin: [0, 0], grid: { cell_m: 1, rows: ["###", "#.#", "#D#"] }, connections: [{ door: [1, 2], target: "map-town" }] }
  const building = { ...base("building-a", "buildings"), map: "map-town", rooms: [room.id], layout: { width: 3, depth: 3, cell_m: 1 }, site_plan: { origin: [2, 2], rotation_quarters: 0 } }
  const route: { from: { document: string; room?: string; door: number[] }; door: number[]; width_m: number; points_tiles: number[][]; status: string } = {
    from: { document: building.id, room: room.id, door: [1, 2] },
    door: [1, 0],
    width_m: 1,
    points_tiles: [
      [3.5, 5],
      [3.5, 8],
    ],
    status: "proposed",
  }
  const facility = {
    ...base("facility-a", "facilities"),
    sanitation_role: "privy",
    grid: { cell_m: 1, rows: ["#D#", "#.#", "###"] },
    site: { map: "map-town", occupied_rect_tiles: [2, 8, 5, 11] },
    connections: [{ door: [1, 0], target: "map-town" }],
    access_routes: [route],
  }
  const docs = new Map<string, SettingDocument>([room, building, facility].map((d) => [d.id, d]))
  const obstacles: OutdoorObstacle[] = [],
    water = {
      points: [
        [15, 0],
        [15, 20],
      ],
      half_width: 0.2,
    }
  return { room, building, facility, route, docs, obstacles, water, check: () => auditOutdoorAccess({ doc: facility, documents: docs, obstacles: obstacles, metres: 1, mapTiles: 20, water: water }) }
}
it("joins the house and facility through their exact outdoor doors", () => {
  expect(fixture().check()).toEqual([])
})
it("reserves body width even when the center line misses an obstacle", () => {
  const f = fixture()
  f.obstacles.push({ id: "building-b", map: "map-town", rect: [3.8, 6, 4.2, 7] })
  expect(f.check()).toContain("Access route 1: path crosses building-b")
})
it("does not use an unrelated map's obstacle", () => {
  const f = fixture()
  f.obstacles.push({ id: "building-b", map: "map-other", rect: [3, 6, 4, 7] })
  expect(f.check()).toEqual([])
})
it("rejects a path wider than its doorway", () => {
  const f = fixture()
  f.route.width_m = 2
  expect(f.check()).toContain("Access route 1: path is wider than an endpoint door")
})
it("rejects an offset door connection", () => {
  const f = fixture()
  f.route.points_tiles[0] = [3.6, 5]
  expect(f.check()).toContain("Access route 1: path does not join its exact doorway")
})
it("requires outward departure and inward arrival", () => {
  const f = fixture()
  f.route.points_tiles = [
    [3.5, 5],
    [3.5, 4],
    [3.5, 8],
  ]
  expect(f.check()).toContain("Access route 1: path does not leave and enter through the doorway normals")
})
it("does not let later segments cut back through the house", () => {
  const f = fixture()
  f.route.points_tiles = [
    [3.5, 5],
    [3.5, 6],
    [1, 6],
    [1, 3],
    [3.5, 3],
    [3.5, 8],
  ]
  expect(f.check()).toContain("Access route 1: path crosses building-a")
})
it.each([
  [
    [3.5, 5],
    [4, 6],
    [3.5, 8],
  ],
  [
    [3.5, 5],
    [3.5, 5],
    [3.5, 8],
  ],
])("rejects diagonal or empty segments", (...points) => {
  const f = fixture()
  f.route.points_tiles = points
  expect(f.check()).toContain("Access route 1: use nonzero axis-aligned segments")
})
it("checks the full river segment against the passage envelope", () => {
  const f = fixture()
  f.water.points = [
    [0, 6.5],
    [20, 6.5],
  ]
  expect(f.check()).toContain("Access route 1: path covers water")
})
it("rejects a path that leaves the map", () => {
  const f = fixture()
  f.route.points_tiles = [
    [3.5, 5],
    [3.5, 6],
    [-1, 6],
    [-1, 7],
    [3.5, 7],
    [3.5, 8],
  ]
  expect(f.check()).toContain("Access route 1: path leaves the map")
})
it("requires the source room to belong to its building", () => {
  const f = fixture()
  f.building.rooms = []
  expect(f.check()).toContain("Access route 1: endpoints have no matching outdoor doors on one map")
})
it("requires both endpoints on the same map", () => {
  const f = fixture()
  f.building.map = "map-other"
  expect(f.check()).toContain("Access route 1: endpoints have no matching outdoor doors on one map")
})
it("keeps proposed access from passing the design gate", () => {
  const f = fixture()
  f.facility.design_gate = "通過"
  expect(f.check()).toContain("Access route 1: access is still proposed")
  f.facility.access_routes = []
  expect(f.check()).toContain("Sanitation facility has no access route")
})
it("connects a facility source through its own exterior doorway", () => {
  const f = fixture()
  const source = { ...base("facility-source", "facilities"), grid: f.room.grid, site: { map: "map-town", occupied_rect_tiles: [2, 2, 5, 5] }, connections: f.room.connections }
  f.docs.set(source.id, source)
  f.route.from = { document: source.id, door: [1, 2] }
  expect(f.check()).toEqual([])
})
it("rotates a facility doorway with its occupied footprint", () => {
  const f = fixture()
  Object.assign(f.facility.site, { rotation_quarters: 1 })
  // The north door rotates to the west edge, facing west.
  f.route.points_tiles = [
    [3.5, 5],
    [3.5, 6],
    [1, 6],
    [1, 9.5],
    [2, 9.5],
  ]
  expect(f.check()).toEqual([])
})
it("requires access from every documented material source before passing", () => {
  const f = fixture()
  f.facility.design_gate = "通過"
  f.route.status = "designed"
  f.docs.set("facility-unconnected", { ...base("facility-unconnected", "facilities"), material_routes: [{ to: f.facility.id }] })
  expect(f.check()).toContain("Material source facility-unconnected has no access route")
  f.docs.delete("facility-unconnected")
  f.docs.set(f.room.id, { ...f.room, material_routes: [{ to: f.facility.id }] })
  expect(f.check()).toEqual([])
})
