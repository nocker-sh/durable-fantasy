import { expect, it } from "vitest"
import { auditSiteApproaches } from "#/scripts/lib/audit-site-approaches"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const room = {
    ...base("room-a", "rooms"),
    building: "building-a",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 1, rows: ["###", "#.#", "#D#"] },
    connections: [{ door: [1, 2], width_cells: 1, target: "map-town" }],
  }
  const approach = {
    room: room.id,
    door: [1, 2],
    width_m: 1,
    points_tiles: [
      [2.75, 4.5],
      [2.75, 6],
    ],
  }
  const building = {
    ...base("building-a", "buildings"),
    map: "map-town",
    rooms: [room.id],
    layout: { width: 3, depth: 3, cell_m: 1 },
    site_plan: { origin: [2, 3], rotation_quarters: 0, approaches: [approach] },
  }
  const docs = new Map<string, SettingDocument>([[room.id, room]]),
    roads = [
      {
        pts: [
          [0, 6],
          [10, 6],
        ],
        w: 0.25,
      },
    ]
  return { building, room, approach, docs, roads }
}
it("joins the actual doorway to a road", () => {
  const f = fixture()
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toEqual([])
})
it.each([
  [
    1,
    [
      [3.5, 3.75],
      [5, 3.75],
    ],
    [
      [5, 0],
      [5, 10],
    ],
  ],
  [
    2,
    [
      [2.75, 3],
      [2.75, 1],
    ],
    [
      [0, 1],
      [10, 1],
    ],
  ],
  [
    3,
    [
      [2, 3.75],
      [0, 3.75],
    ],
    [
      [0, 0],
      [0, 10],
    ],
  ],
] as const)("rotates both the door position and outward direction by %s quarter turns", (rotation, points, road) => {
  const f = fixture()
  f.building.site_plan.rotation_quarters = rotation
  f.approach.points_tiles = points.map((p) => [...p])
  f.roads[0].pts = road.map((p) => [...p])
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toEqual([])
})
it("does not substitute an old door marker for the planned doorway", () => {
  const f = fixture()
  f.approach.points_tiles[0] = [2, 4]
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toContain("Approach starts away from its rotated doorway")
})
it("checks the path width against neighboring buildings and the door width", () => {
  const f = fixture(),
    houses = [{ id: "b", map: "town", x0: 2.9, z0: 5, x1: 4, z1: 6 }]
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: houses, metresPerTile: 2, roads: f.roads })).toContain("Approach crosses building-b")
  f.approach.width_m = 2
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toContain("Approach is wider than its door")
})
it("rejects an approach that turns back through its own house or stops short of a road", () => {
  const f = fixture()
  f.approach.points_tiles = [
    [2.75, 4.5],
    [2.75, 5.5],
    [2.75, 3.5],
    [2.75, 6],
  ]
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toContain("Approach returns through its own building")
  f.approach.points_tiles = [
    [2.75, 4.5],
    [2.75, 5.4],
  ]
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toContain("Approach does not meet a road")
})
it("requires an approach for each exterior door", () => {
  const f = fixture()
  f.building.site_plan.approaches = []
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads })).toContain("room-a: exterior door has no approach")
})
it("checks the same passage width against a documented outdoor work installation", () => {
  const f = fixture()
  expect(
    auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads, obstacles: [{ id: "facility-oven", map: "map-town", rect: [2.9, 5, 4, 6] }] }),
  ).toContain("Approach crosses facility-oven")
})
it("rejects a river crossing even when neither path endpoint is in water", () => {
  const f = fixture(),
    ground = {
      map_tiles: 20,
      watercourses: [
        {
          name: "river",
          points: [
            [0, 5],
            [10, 5],
          ],
          half_width: 0.1,
        },
      ],
    }
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads, obstacles: [], ground: ground })).toContain("Approach crosses watercourse river")
})
it("accounts for water width and body width beside a parallel bank", () => {
  const f = fixture(),
    ground = {
      map_tiles: 20,
      watercourses: [
        {
          name: "river",
          points: [
            [3.1, 0],
            [3.1, 10],
          ],
          half_width: 0.15,
        },
      ],
    }
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads, obstacles: [], ground: ground })).toContain("Approach crosses watercourse river")
  ground.watercourses[0].points = [
    [3.3, 0],
    [3.3, 10],
  ]
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads, obstacles: [], ground: ground })).toEqual([])
})
it("keeps the whole body inside the map when the center line stays inside", () => {
  const f = fixture()
  f.approach.points_tiles = [
    [2.75, 4.5],
    [2.75, 5.5],
    [0.1, 5.5],
    [0.1, 6],
  ]
  expect(auditSiteApproaches({ building: f.building, documents: f.docs, houses: [], metresPerTile: 2, roads: f.roads, obstacles: [], ground: { map_tiles: 20, watercourses: [] } })).toContain(
    "Approach leaves its map",
  )
})
