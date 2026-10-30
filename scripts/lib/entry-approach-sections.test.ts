import { hasEntryApproachSections } from "#/scripts/lib/has-entry-approach-sections"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import { expect, it } from "vitest"
import { ScalarField } from "#/lib/engine/scalar-field"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { auditEntryApproachSections } from "#/scripts/lib/audit-entry-approach-sections"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Road } from "#/world/maps/layout-types"

function fixture() {
  const room: SettingDocument = {
    id: "room",
    kind: "rooms",
    title: "room",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    building: "building-home",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 0.5, rows: ["######", "#....#", "#....#", "#....#", "#....#", "##DD##"] },
    connections: [{ target: "map-town", door: [2, 5], width_cells: 2 }],
  }
  const steps: EntrySteps = { room: "room", door: [2, 5], risers: 4, going_m: 0.28, clear_width_m: 0.9, rail_inset_m: 0.05, landing_depth_m: 1, lower_elevation_m: 0.1 }
  const building: SettingDocument = {
    id: "building-home",
    kind: "buildings",
    title: "home",
    status: "設計中",
    source: "test",
    design_gate: "未通過",
    issues: [],
    map: "map-town",
    rooms: [room.id],
    layout: { width: 6, depth: 6, cell_m: 0.5 },
    site_plan: { origin: [5, 5], rotation_quarters: 0 },
    foundation: { floor_elevation_m: 0.7, floor_thickness_m: 0.2, minimum_ground_gap_m: 0.1 },
    entry_steps: [steps],
  }
  const documents = new Map([[room.id, room]])
  const geometry = entryStepGeometry({ building, documents, steps, metres: 1 })!
  const section = { status: "proposed", scope: "level_turn_road_profile", road_index: 0, maximum_longitudinal_grade: 0.05, maximum_cut_m: 0.2, maximum_fill_m: 0.2, pending: ["drainage"] }
  const approach = { room: room.id, door: steps.door, width_m: 0.9, points_tiles: [geometry.upperPoint, geometry.lowerPoint, [10, geometry.lowerPoint[1]], [10, 16]], section }
  building.site_plan = { origin: [5, 5], rotation_quarters: 0, approaches: [approach] }
  const roads: Road[] = [
    {
      pts: [
        [2, 16],
        [20, 16],
      ],
      w: 1,
      kind: "dirt",
    },
  ]
  return { building, documents, approach, section, roads, terrain: new ScalarField(new Float32Array(24 ** 2), 24), metres: 1 }
}

it("audits the declared profile, catches tighter limits and preserves the proposed design gate", () => {
  const f = fixture()
  expect(auditEntryApproachSections(f)).toEqual([])
  f.section.maximum_fill_m = 0.05
  expect(auditEntryApproachSections(f)).toContain("Entry surface exceeds its reserved earthworks")
  f.section.maximum_fill_m = 0.2
  f.section.maximum_longitudinal_grade = 0.001
  expect(auditEntryApproachSections(f)).toContain("Entry surface exceeds its reserved longitudinal grade")
  f.section.maximum_longitudinal_grade = 0.05
  f.building.design_gate = "通過"
  expect(auditEntryApproachSections(f)).toContain("Entry surface is still proposed")
})

it("rejects a stale road or lower landing instead of changing the source data", () => {
  const f = fixture()
  f.section.road_index = 1
  const before = JSON.stringify(f.building)
  expect(auditEntryApproachSections(f)).toContain("Entry surface has no referenced road")
  expect(JSON.stringify(f.building)).toBe(before)
  f.section.road_index = 0
  f.approach.points_tiles[1] = [6.5, 10]
  expect(auditEntryApproachSections(f)).toContain("Entry surface does not fit its lower landing")
})

it("does not invent a stair requirement for level doorways without an exterior stair", () => {
  const f = fixture()
  f.building.entry_steps = []
  f.building.design_gate = "通過"
  const approach = { room: f.approach.room, door: f.approach.door, width_m: f.approach.width_m, points_tiles: f.approach.points_tiles }
  f.building.site_plan = { origin: [5, 5], rotation_quarters: 0, approaches: [approach] }
  expect(auditEntryApproachSections(f)).toEqual([])
  f.building.entry_steps = [{ room: "room", door: [2, 5], risers: 4, going_m: 0.28, clear_width_m: 0.9, rail_inset_m: 0.05, landing_depth_m: 1, lower_elevation_m: 0.1 }]
  expect(auditEntryApproachSections(f)).toContain("Entry approach has no designed surface section")
})

it("checks the width of the existing-road cap rather than accepting a centre point alone", () => {
  const f = fixture()
  f.roads[0].w = 0.2
  expect(auditEntryApproachSections(f)).toContain("Entry surface road cap is not certified inside its referenced road")
})

it("keeps a valid narrow road when the entire cap fits without shrinking the authored walkway", () => {
  const f = fixture()
  f.roads[0].w = 0.5
  expect(auditEntryApproachSections(f)).toEqual([])
  expect(f.approach.width_m).toBe(0.9)
})

it("keeps a declared surface in the audit when its required stair data is missing", () => {
  const f = fixture()
  f.building.entry_steps = undefined
  expect(hasEntryApproachSections(f.building)).toBe(true)
  expect(auditEntryApproachSections(f)).toContain("Entry surface has no designed exterior stairs")
  f.building.site_plan = {
    approaches: [
      {
        room: "room",
        door: [2, 5],
        width_m: 0.9,
        points_tiles: [
          [6.5, 8],
          [6.5, 11],
        ],
      },
    ],
  }
  expect(hasEntryApproachSections(f.building)).toBe(false)
})
