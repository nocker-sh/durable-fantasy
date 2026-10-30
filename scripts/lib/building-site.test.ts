import { expect, it } from "vitest"
import { auditBuildingSite } from "#/scripts/lib/audit-building-site"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const document = (): SettingDocument => ({
  id: "building-a",
  kind: "buildings",
  title: "家",
  source: "test",
  status: "設計中",
  design_gate: "未通過",
  issues: [],
  map: "map-town",
  layout: { width: 8, depth: 12, cell_m: 0.5 },
  site_plan: { origin: [2, 3], rotation_quarters: 0 },
})
it("converts actual metres to outdoor tiles and swaps dimensions on a quarter turn", () => {
  const doc = document()
  expect(auditBuildingSite({ building: doc, houses: [], metresPerTile: 2, roads: [] }).bounds).toEqual([2, 3, 4, 6])
  doc.site_plan = { origin: [2, 3], rotation_quarters: 1 }
  expect(auditBuildingSite({ building: doc, houses: [], metresPerTile: 2, roads: [] }).bounds).toEqual([2, 3, 5, 5])
})
it("does not overlook another house while excluding this building's old footprint and other maps", () => {
  const doc = document(),
    house = { id: "b", map: "town", x0: 3, z0: 4, x1: 5, z1: 7 }
  expect(auditBuildingSite({ building: doc, houses: [house], metresPerTile: 2, roads: [] }).problems).toContain("Outdoor footprint overlaps building-b")
  expect(
    auditBuildingSite({
      building: doc,
      houses: [
        { ...house, id: "a" },
        { ...house, map: "elsewhere" },
      ],
      metresPerTile: 2,
      roads: [],
    }).problems,
  ).toEqual([])
})
it("detects a road crossing the footprint even when both segment endpoints are far outside", () => {
  expect(
    auditBuildingSite({
      building: document(),
      houses: [],
      metresPerTile: 2,
      roads: [
        {
          pts: [
            [-10, 4],
            [20, 4],
          ],
          w: 0.2,
        },
      ],
    }).problems,
  ).toContain("Outdoor footprint covers road 1")
})
it("checks road width at a corner rather than testing only its centre line", () => {
  expect(
    auditBuildingSite({
      building: document(),
      houses: [],
      metresPerTile: 2,
      roads: [
        {
          pts: [
            [1, 2.6],
            [5, 2.6],
          ],
          w: 0.5,
        },
      ],
    }).problems,
  ).toContain("Outdoor footprint covers road 1")
  expect(
    auditBuildingSite({
      building: document(),
      houses: [],
      metresPerTile: 2,
      roads: [
        {
          pts: [
            [1, 2],
            [5, 2],
          ],
          w: 0.5,
        },
      ],
    }).problems,
  ).toEqual([])
})
it("does not pass a site plan that is still proposed or contains unresolved placement conditions", () => {
  const doc = document()
  doc.design_gate = "通過"
  expect(auditBuildingSite({ building: doc, houses: [], metresPerTile: 2, roads: [] }).problems).toContain("Outdoor site plan is not finalized")
  doc.site_plan = { origin: [2, 3], rotation_quarters: 0, status: "designed", unresolved: ["入口の接続"] }
  expect(auditBuildingSite({ building: doc, houses: [], metresPerTile: 2, roads: [] }).problems).toContain("Outdoor site plan is not finalized")
})
it("uses the actual outdoor map size rather than an indoor presentation size", () => {
  expect(auditBuildingSite({ building: document(), houses: [], metresPerTile: 2, roads: [], mapTiles: 5 }).problems).toContain("Outdoor footprint leaves its map")
})
