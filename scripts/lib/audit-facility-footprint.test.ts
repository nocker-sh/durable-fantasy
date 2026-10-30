import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditFacilityFootprint } from "#/scripts/lib/audit-facility-footprint"
const doc: SettingDocument = {
  id: "facility-privy",
  kind: "facilities",
  title: "便所",
  source: "test",
  status: "設計中",
  design_gate: "未通過",
  issues: [],
  site: { map: "map-square", status: "proposed", occupied_rect_tiles: [3, 3, 5, 5] },
}
const water = {
  points: [
    [8, 0],
    [8, 10],
  ],
  half_width: 0.4,
}
it("checks a proposed footprint without implying its design is completed", () => {
  expect(auditFacilityFootprint({ doc: doc, houses: [], roads: [], mapTiles: 10, metresPerTile: 1, water: water, facilities: [] })).toEqual([])
})
it("does not place equipment through houses or other equipment", () => {
  const errors = auditFacilityFootprint({
    doc: doc,
    houses: [{ id: "home", map: "square", x0: 4, z0: 4, x1: 6, z1: 6 }],
    roads: [],
    mapTiles: 10,
    metresPerTile: 1,
    water: water,
    facilities: [{ id: "facility-water", map: "map-square", rect: [2, 2, 4, 4] }],
  })
  expect(errors).toContain("Facility footprint overlaps building-home")
  expect(errors).toContain("Facility footprint overlaps facility-water")
})
it("checks the full width of roads and water rather than just vertices", () => {
  expect(
    auditFacilityFootprint({
      doc: doc,
      houses: [],
      roads: [
        {
          pts: [
            [0, 2.5],
            [10, 2.5],
          ],
          w: 0.6,
        },
      ],
      mapTiles: 10,
      metresPerTile: 1,
      water: {
        points: [
          [0, 4],
          [10, 4],
        ],
        half_width: 0.2,
      },
      facilities: [],
    }),
  ).toEqual(["Facility footprint covers road 1", "Facility footprint covers water"])
})
it("does not let a proposed facility leave the map", () => {
  expect(
    auditFacilityFootprint({
      doc: { ...doc, site: { map: "map-square", status: "proposed", occupied_rect_tiles: [9, 9, 11, 11] } },
      houses: [],
      roads: [],
      mapTiles: 10,
      metresPerTile: 1,
      water: water,
      facilities: [],
    }),
  ).toContain("Facility footprint leaves its map")
})

it("compares authored grid metres to the outdoor footprint rather than the display scale", () => {
  const gridded = { ...doc, grid: { cell_m: 1, rows: ["..", "..", ".."] }, site: { map: "map-square", occupied_rect_tiles: [1, 3, 2, 4.5] } }
  expect(auditFacilityFootprint({ doc: gridded, houses: [], roads: [], mapTiles: 10, metresPerTile: 2, water: water, facilities: [] })).toEqual([])
  expect(auditFacilityFootprint({ doc: gridded, houses: [], roads: [], mapTiles: 10, metresPerTile: 1, water: water, facilities: [] })).toContain(
    "Facility footprint disagrees with its grid dimensions",
  )
})
it("rotates the grid's external dimensions consistently", () => {
  const gridded = { ...doc, grid: { cell_m: 1, rows: ["..", "..", ".."] }, site: { map: "map-square", rotation_quarters: 1, occupied_rect_tiles: [1, 3, 4, 5] } }
  expect(auditFacilityFootprint({ doc: gridded, houses: [], roads: [], mapTiles: 10, metresPerTile: 1, water: water, facilities: [] })).toEqual([])
})
