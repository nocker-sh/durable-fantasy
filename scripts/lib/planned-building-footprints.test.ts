import { expect, it } from "vitest"
import { plannedBuildingFootprints } from "#/scripts/lib/planned-building-footprints"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const house = { id: "a", map: "town", x0: 1, z0: 1, x1: 3, z1: 3, name: "家" }
function fixture(): SettingDocument {
  return {
    id: "building-a",
    kind: "buildings",
    title: "家",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    layout: { cell_m: 0.5, width: 12, depth: 14 },
    site_plan: { origin: [20, 30], rotation_quarters: 1 },
    roof_section: { ridge_axis: "y", eave_underside_m: 4, ridge_underside_m: 6, overhang_m: 0.4, material: "roof" },
  }
}
it("projects the wall and roof at the same rotated site with the outdoor scale", () => {
  const docs = new Map([["building-a", fixture()]])
  expect(plannedBuildingFootprints({ houses: [house], documents: docs, metresPerTile: 2 })).toEqual([{ ...house, x0: 20, z0: 30, x1: 23.5, z1: 33 }])
  expect(plannedBuildingFootprints({ houses: [house], documents: docs, metresPerTile: 2, includeRoofs: true })).toEqual([{ ...house, x0: 19.8, z0: 29.8, x1: 23.7, z1: 33.2 }])
})
it("keeps the source footprint until an outdoor site exists, even if a roof is designed", () => {
  const doc = fixture()
  delete doc.site_plan
  expect(plannedBuildingFootprints({ houses: [house], documents: new Map([[doc.id, doc]]), metresPerTile: 2, includeRoofs: true })).toEqual([house])
})
it("uses the proposed walls when the roof is not yet designed without changing source data", () => {
  const doc = fixture()
  delete doc.roof_section
  const before = structuredClone(doc),
    original = structuredClone(house)
  expect(plannedBuildingFootprints({ houses: [house], documents: new Map([[doc.id, doc]]), metresPerTile: 2, includeRoofs: true })[0].x0).toBe(20)
  expect(doc).toEqual(before)
  expect(house).toEqual(original)
})
