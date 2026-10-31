import { expect, it } from "vitest"
import { getAuthoredFloorLevels } from "#/scripts/lib/get-authored-floor-levels"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function fixture(): SettingDocument {
  return {
    id: "building",
    kind: "buildings",
    title: "building",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    foundation: { floor_thickness_m: 0.35 },
    floor_levels: [
      { floor: 0, elevation_m: 0, ceiling_elevation_m: 2.32 },
      { floor: 1, elevation_m: 2.52, ceiling_elevation_m: 4.9 },
    ],
  }
}
it("derives upper floor thickness without changing the authored heights", () => {
  const building = fixture(),
    original = structuredClone(building)
  expect(getAuthoredFloorLevels(building, 2)).toEqual([
    { floor: 0, elevation: 0, ceiling: 2.32, thickness: 0.35 },
    { floor: 1, elevation: 2.52, ceiling: 4.9, thickness: 2.52 - 2.32 },
  ])
  expect(building).toEqual(original)
})
it("does not coerce a foundation thickness string into physical structure", () => {
  const building = fixture()
  building.foundation = { floor_thickness_m: "0.35" }
  expect(() => getAuthoredFloorLevels(building, 2)).toThrow("floor thickness")
})
it.each([null, "2.32"])("does not export an unknown or coerced ceiling: %j", (ceiling_elevation_m) => {
  const building = fixture()
  building.floor_levels = [{ floor: 0, elevation_m: 0, ceiling_elevation_m }]
  expect(() => getAuthoredFloorLevels(building, 1)).toThrow("floor levels are incomplete")
})
