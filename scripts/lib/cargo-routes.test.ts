import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditCargoRoutes } from "#/scripts/lib/cargo-routes"
function fixture(): SettingDocument {
  return {
    id: "room-workshop",
    kind: "rooms",
    title: "工房",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    grid: { cell_m: 1, rows: ["##########", "#........#", "#........#", "#........#", "#........#", "#........#", "#........#", "#........#", "#........#", "##########"] },
    cargo_routes: [
      {
        activity: "材料を運ぶ",
        length_m: 2,
        width_m: 0.8,
        clearance_m: 0.1,
        points_m: [
          [3, 6],
          [3, 3],
        ],
      },
    ],
  }
}
it("checks the continuous envelope rather than only its endpoint footprints", () => {
  const f = fixture()
  expect(auditCargoRoutes(f)).toEqual([])
  f.grid!.rows[4] = "###A.....#"
  expect(auditCargoRoutes(f)).toContain("Cargo route 1: sweep hits A")
})
it("includes the load's ends and explicit handling clearance", () => {
  const f = fixture()
  f.grid!.rows[1] = "###A.....#"
  expect(auditCargoRoutes(f)).toContain("Cargo route 1: sweep hits A")
})
it("reserves the whole turning circle even if both straight segments fit", () => {
  const f = fixture()
  f.cargo_routes = [
    {
      activity: "家具を運ぶ",
      length_m: 2.8,
      width_m: 0.8,
      clearance_m: 0.1,
      points_m: [
        [3, 6],
        [3, 3],
        [6, 3],
      ],
    },
  ]
  f.grid!.rows[1] = "#A.......#"
  expect(auditCargoRoutes(f)).toContain("Cargo route 1: turn hits A")
  expect(auditCargoRoutes(f)).not.toContain("Cargo route 1: sweep hits A")
})
it("rejects diagonal moves and repeated points instead of silently skipping their sweep", () => {
  const f = fixture()
  for (const points_m of [
    [
      [3, 6],
      [4, 4],
    ],
    [
      [3, 6],
      [3, 6],
    ],
  ]) {
    f.cargo_routes = [{ activity: "運搬", length_m: 2, width_m: 0.8, clearance_m: 0, points_m }]
    expect(auditCargoRoutes(f)).toContain("Cargo route 1: use nonzero axis-aligned segments")
  }
})
it("does not shrink the carrier or let the envelope leave the drawing", () => {
  const f = fixture()
  f.cargo_routes = [
    {
      activity: "運搬",
      length_m: 2,
      width_m: 0.3,
      clearance_m: 0,
      points_m: [
        [3, 6],
        [3, 0],
      ],
    },
  ]
  expect(auditCargoRoutes(f)).toContain("Cargo route 1: envelope omits the carrier's design width")
  expect(auditCargoRoutes(f)).toContain("Cargo route 1: envelope leaves the room drawing")
})
it("keeps open door panels in the route's obstacles", () => {
  const f = fixture()
  f.grid!.rows[9] = "###DD#####"
  f.connections = [{ door: [3, 9], width_cells: 2, target: "map-town" }]
  f.door_leaves = [{ door: [3, 9], hinge: "start", frame_inset_m: 0.05, thickness_m: 0.04, waits_for: [] }]
  f.cargo_routes = [
    {
      activity: "運搬",
      length_m: 0.8,
      width_m: 0.8,
      clearance_m: 0,
      points_m: [
        [3.4, 8],
        [3.4, 6],
      ],
    },
  ]
  expect(auditCargoRoutes(f)).toContain("Cargo route 1: sweep hits open door")
  f.door_leaves = []
  expect(auditCargoRoutes(f)).toContain("Cargo route has an undesigned door leaf")
})
it("does not infer geometry for an unplanned room", () => {
  const f = fixture()
  f.grid = null
  expect(auditCargoRoutes(f)).toEqual(["Cargo route has no room grid"])
})

it("retains side jambs inside a doorway even when the open panel and every wall cell are clear", () => {
  const room = fixture()
  room.grid!.rows[9] = "###DD#####"
  room.connections = [{ door: [3, 9], width_cells: 2, target: "map-town" }]
  room.door_leaves = [{ door: [3, 9], hinge: "end", frame_inset_m: 0.1, thickness_m: 0.04, waits_for: [] }]
  room.cargo_routes = [
    {
      activity: "運搬",
      length_m: 0.8,
      width_m: 0.8,
      clearance_m: 0,
      points_m: [
        [3.45, 9.5],
        [3.45, 8],
      ],
    },
  ]
  const before = JSON.stringify(room)
  expect(auditCargoRoutes(room)).toEqual(["Cargo route 1: sweep hits door frame"])
  expect(JSON.stringify(room)).toBe(before)
  room.cargo_routes = [
    {
      activity: "運搬",
      length_m: 0.8,
      width_m: 0.8,
      clearance_m: 0,
      points_m: [
        [3.55, 9.5],
        [3.55, 8],
      ],
    },
  ]
  expect(auditCargoRoutes(room)).toEqual([])
})

it("rejects missing or invalid frame dimensions rather than substituting an unframed opening", () => {
  const room = fixture()
  room.grid!.rows[9] = "###DD#####"
  room.connections = [{ door: [3, 9], width_cells: 2, target: "map-town" }]
  room.door_leaves = [{ door: [3, 9], hinge: "end", thickness_m: 0.04, waits_for: [] }]
  expect(auditCargoRoutes(room)).toEqual(["Cargo route needs the door frame inset"])
  room.door_leaves = [{ door: [3, 9], hinge: "end", frame_inset_m: 1, thickness_m: 0.04, waits_for: [] }]
  expect(auditCargoRoutes(room)).toEqual(["Invalid door frame geometry"])
  room.connections = [{ door: [3, 9], width_cells: "2", target: "map-town" }]
  expect(auditCargoRoutes(room)).toEqual(["Cargo route has invalid doorway geometry"])
})
