import { expect, it } from "vitest"
import { ScalarField } from "../../lib/engine/scalar-field"
import { auditBuildingFoundation } from "#/scripts/lib/audit-building-foundation"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const building: SettingDocument = {
    id: "building-home",
    kind: "buildings",
    title: "家",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    map: "map-town",
    floor_levels: [{ floor: 0, elevation_m: 0 }],
    layout: { width: 6, depth: 6, cell_m: 0.5 },
    site_plan: { origin: [5, 5], rotation_quarters: 0 },
    foundation: { floor_elevation_m: 0.95, floor_thickness_m: 0.2, minimum_ground_gap_m: 0.1 },
  }
  return { building, terrain: new ScalarField(new Float32Array(16 ** 2), 16) }
}
it("keeps the proposed floor underside above all the terrain, not just the four corners", () => {
  const f = fixture(),
    before = JSON.stringify(f.building)
  expect(auditBuildingFoundation(f.building, f.terrain, 1)).toEqual([])
  f.terrain.data[6 * 16 + 6] = 1
  expect(auditBuildingFoundation(f.building, f.terrain, 1)).toEqual(["Raised floor intersects terrain or lacks its designed ground gap"])
  expect(JSON.stringify(f.building)).toBe(before)
})
it("converts terrain's vertical tiles into metres as well as its horizontal footprint", () => {
  const f = fixture()
  f.terrain.data.fill(0.5)
  expect(auditBuildingFoundation(f.building, f.terrain, 1.4)).toHaveLength(1)
  f.terrain.data.fill(0.4)
  expect(auditBuildingFoundation(f.building, f.terrain, 1.4)).toEqual([])
})
it("does not accept a foundation without an authored footprint", () => {
  const f = fixture()
  delete f.building.site_plan
  expect(auditBuildingFoundation(f.building, f.terrain, 1)).toEqual(["Foundation has no dimensioned site plan"])
})

it("keeps the world datum separate from relative indoor floor heights", () => {
  const f = fixture()
  f.building.floor_levels = [{ floor: 0, elevation_m: 0.95 }]
  expect(auditBuildingFoundation(f.building, f.terrain, 1)).toEqual(["Foundation needs a ground floor at relative elevation zero"])
})

it("rejects malformed foundation dimensions instead of accepting a failed numeric comparison", () => {
  for (const foundation of [
    null,
    false,
    {},
    { floor_elevation_m: NaN, floor_thickness_m: 0.2, minimum_ground_gap_m: 0.1 },
    { floor_elevation_m: 1, floor_thickness_m: -0.2, minimum_ground_gap_m: 0.1 },
  ]) {
    const source = fixture()
    source.building.foundation = foundation
    expect(auditBuildingFoundation(source.building, source.terrain, 1)).toEqual(["Invalid building foundation"])
  }
})

it("rejects an unsampled foundation footprint instead of checking the clamped field edge", () => {
  const source = fixture()
  const terrain = new ScalarField(new Float32Array(9), 3)
  expect(auditBuildingFoundation(source.building, terrain, 1)).toEqual(["Foundation footprint exceeds sampled terrain"])
})
