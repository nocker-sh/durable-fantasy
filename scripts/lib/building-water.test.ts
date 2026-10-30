import { expect, it } from "vitest"
import { auditBuildingWater } from "./building-water"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const building = (): SettingDocument => ({
  id: "building-a",
  kind: "buildings",
  title: "家",
  status: "設計中",
  source: "test",
  design_gate: "未通過",
  issues: [],
  site_plan: { origin: [0, 0], rotation_quarters: 0 },
  layout: { cell_m: 0.5, width: 10, depth: 10 },
})
it("checks the river's width when its centreline lies outside the footprint", () => {
  expect(
    auditBuildingWater(building(), 1, [
      {
        name: "川",
        points: [
          [5.4, -2],
          [5.4, 8],
        ],
        half_width: 0.6,
      },
    ]),
  ).toEqual(["Outdoor footprint covers watercourse 川"])
})
it("does not mistake distant water or boundary contact for positive overlap", () => {
  expect(
    auditBuildingWater(building(), 1, [
      {
        name: "川",
        points: [
          [6, -2],
          [6, 8],
        ],
        half_width: 0.6,
      },
    ]),
  ).toEqual([])
  expect(
    auditBuildingWater(building(), 1, [
      {
        name: "川",
        points: [
          [6, -2],
          [6, 8],
        ],
        half_width: 1,
      },
    ]),
  ).toEqual([])
})
it("checks whole segments rather than only the sampled points", () => {
  expect(
    auditBuildingWater(building(), 1, [
      {
        name: "川",
        points: [
          [-4, -4],
          [9, 9],
        ],
        half_width: 0.5,
      },
    ]),
  ).toEqual(["Outdoor footprint covers watercourse 川"])
})
it("uses metres per outdoor tile when comparing the building and river", () => {
  expect(
    auditBuildingWater(building(), 2, [
      {
        name: "川",
        points: [
          [4, -2],
          [4, 8],
        ],
        half_width: 0.6,
      },
    ]),
  ).toEqual([])
})
it("rejects unusable watercourse geometry", () => {
  expect(
    auditBuildingWater(building(), 1, [
      {
        name: "川",
        points: [
          [0, Number.NaN],
          [1, 2],
        ],
        half_width: 1,
      },
    ]),
  ).toEqual(["Invalid watercourse 川"])
})
it("checks overhanging roofs even when the walls stay on dry land", () => {
  const doc = building()
  doc.roof_section = { ridge_axis: "y", eave_underside_m: 4, ridge_underside_m: 6, overhang_m: 0.5, material: "roof" }
  expect(
    auditBuildingWater(doc, 1, [
      {
        name: "川",
        points: [
          [6, -2],
          [6, 8],
        ],
        half_width: 0.75,
      },
    ]),
  ).toEqual(["Roof overhang covers watercourse 川"])
  expect(
    auditBuildingWater(doc, 1, [
      {
        name: "川",
        points: [
          [6, -2],
          [6, 8],
        ],
        half_width: 0.5,
      },
    ]),
  ).toEqual([])
  expect(
    auditBuildingWater(doc, 2, [
      {
        name: "川",
        points: [
          [3, -2],
          [3, 8],
        ],
        half_width: 0.3,
      },
    ]),
  ).toEqual(["Roof overhang covers watercourse 川"])
})
