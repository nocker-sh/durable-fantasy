import { expect, it } from "vitest"
import { auditRoofSection } from "#/scripts/lib/audit-roof-section"
import { auditRoofSite } from "#/scripts/lib/audit-roof-site"
import { roofBounds } from "#/scripts/lib/roof-bounds"
import { roofHeightAt } from "#/scripts/lib/roof-height-at"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const roof = { ridge_axis: "y" as "x" | "y", eave_underside_m: 4, ridge_underside_m: 6, overhang_m: 0.3, material: "thatch" }
  const building = {
    id: "building-a",
    kind: "buildings",
    title: "家",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    rooms: ["room-a"],
    layout: { width: 10, depth: 16, cell_m: 0.5 },
    floor_levels: [{ floor: 1, elevation_m: 2.5, ceiling_elevation_m: 4.5 }],
    roof_section: roof,
  }
  const room = {
    id: "room-a",
    kind: "rooms",
    title: "部屋",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    floor: 1,
    origin: [0, 0],
    grid: { cell_m: 0.5, rows: ["##########"] },
    furniture: [{ symbol: "B", name: "寝台", owner: "住民", source: "大工", rect: [1, 1, 2, 4], access: [[3, 2]], use_space: [{ activity: "寝具を整える", rect: [3, 2, 2, 2] }] }],
    connections: [] as { kind: string; furniture: string }[],
  }
  return { building, room, roof, documents: new Map<string, SettingDocument>([[room.id, room]]) }
}
it("uses the ridge direction and clear underside rather than the outer roof surface", () => {
  const f = fixture()
  expect(roofHeightAt({ roof: f.roof, width_m: 5, depth_m: 8, x_m: 0, y_m: 3 })).toBe(4)
  expect(roofHeightAt({ roof: f.roof, width_m: 5, depth_m: 8, x_m: 2.5, y_m: 3 })).toBe(6)
  f.roof.ridge_axis = "x"
  expect(roofHeightAt({ roof: f.roof, width_m: 5, depth_m: 8, x_m: 2.5, y_m: 0 })).toBe(4)
  expect(roofHeightAt({ roof: f.roof, width_m: 5, depth_m: 8, x_m: 2.5, y_m: 4 })).toBe(6)
})
it("checks all of a working area rather than only the high centre of the room", () => {
  const f = fixture()
  expect(auditRoofSection(f.building, f.documents)).toEqual([])
  f.room.furniture[0].use_space[0].rect = [0, 2, 4, 2]
  expect(auditRoofSection(f.building, f.documents)).toContain("room-a/B: roof is too low over operating space")
})
it("does not accept an asserted stair ceiling which lies above the roof underside", () => {
  const f = fixture()
  f.room.connections = [{ kind: "stair", furniture: "B" }]
  f.building.floor_levels[0].ceiling_elevation_m = 5.5
  expect(auditRoofSection(f.building, f.documents)).toContain("room-a: roof intrudes into stair ceiling envelope")
})
it("rejects a ridge below the eaves", () => {
  const f = fixture()
  f.roof.ridge_underside_m = 3.9
  expect(auditRoofSection(f.building, f.documents)).toEqual(["Roof ridge lies below its eaves"])
})
it("requires the floor elevation when computing standing space", () => {
  const f = fixture()
  f.building.floor_levels = []
  expect(auditRoofSection(f.building, f.documents)).toContain("room-a: roof clearance has no room elevation or grid")
})

it("includes the overhang when a wall footprint clears a neighbour or road", () => {
  const f = fixture(),
    building: SettingDocument = { ...f.building, map: "map-town", site_plan: { origin: [5, 5], rotation_quarters: 0 } }
  expect(auditRoofSite({ building: building, houses: [{ id: "b", map: "town", x0: 10.2, z0: 6, x1: 12, z1: 8 }], metresPerTile: 1, roads: [], mapTiles: 48 })).toContain(
    "Roof overhang overlaps building-b",
  )
  expect(
    auditRoofSite({
      building: building,
      houses: [],
      metresPerTile: 1,
      roads: [
        {
          pts: [
            [10.5, 0],
            [10.5, 20],
          ],
          w: 0.25,
        },
      ],
      mapTiles: 48,
    }),
  ).toContain("Roof overhang covers road 1")
})
it("rotates the building before expanding the roof in outdoor units", () => {
  const f = fixture(),
    building: SettingDocument = { ...f.building, site_plan: { origin: [5, 5], rotation_quarters: 1 } }
  expect(roofBounds(building, 1)).toEqual([4.7, 4.7, 13.3, 10.3])
})
