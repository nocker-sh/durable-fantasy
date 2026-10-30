import { expect, it } from "vitest"
import { ScalarField } from "../../lib/engine/scalar-field"
import { auditEntrySteps } from "#/scripts/lib/audit-entry-steps"
import { entryStepGeometry } from "#/scripts/lib/entry-step-geometry"
import { entryOpeningHeight } from "#/scripts/lib/entry-opening-height"
import type { EntrySteps } from "#/scripts/lib/entry-steps-types"
import { auditSiteBounds } from "#/scripts/lib/audit-site-bounds"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
  const steps: EntrySteps = { room: "room", door: [2, 5], risers: 6, going_m: 0.28, clear_width_m: 0.9, rail_inset_m: 0.05, landing_depth_m: 1, lower_elevation_m: 0.05 }
  const room: SettingDocument = {
    ...base("room", "rooms"),
    building: "building-home",
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 0.5, rows: ["######", "#....#", "#....#", "#....#", "#....#", "##DD##"] },
    connections: [{ target: "map-town", door: [2, 5], width_cells: 2 }],
  }
  const building: SettingDocument = {
    ...base("building-home", "buildings"),
    map: "map-town",
    rooms: [room.id],
    entry_opening_height_m: 2,
    floor_levels: [{ floor: 0, elevation_m: 0, ceiling_elevation_m: 2.32 }],
    layout: { width: 6, depth: 6, cell_m: 0.5 },
    site_plan: {
      origin: [5, 5],
      rotation_quarters: 0,
      approaches: [
        {
          room: "room",
          door: [2, 5],
          width_m: 0.9,
          points_tiles: [
            [6.5, 8],
            [6.5, 11.4],
            [6.5, 12],
          ],
        },
      ],
    },
    foundation: { floor_elevation_m: 0.95, floor_thickness_m: 0.2, minimum_ground_gap_m: 0.1 },
    entry_steps: [steps],
  }
  return { building, room, steps, documents: new Map([[room.id, room]]), terrain: new ScalarField(new Float32Array(16 ** 2), 16) }
}
it("derives both landings, treads and the occupied rectangle from the rotated real doorway", () => {
  const f = fixture(),
    geometry = entryStepGeometry({ building: f.building, documents: f.documents, steps: f.steps, metres: 1 })!
  expect(geometry.bounds).toEqual([6, 8, 7, 11.4])
  expect(geometry.surfaces).toHaveLength(7)
  expect(geometry.rise).toBeCloseTo(0.15)
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toEqual([])
  ;(f.building.site_plan as { rotation_quarters: number }).rotation_quarters = 2
  const rotated = entryStepGeometry({ building: f.building, documents: f.documents, steps: f.steps, metres: 1 })!
  expect(rotated.bounds[1]).toBeCloseTo(1.6)
  expect(rotated.bounds[3]).toBe(5)
})
it("rejects a stair whose ground pierces a tread or landing even when the building is clear", () => {
  const f = fixture()
  f.terrain.data[11 * 16 + 6] = 0.2
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Entry stair tread or landing intersects terrain")
})
it("does not gain room by shrinking landings, rails or treads or making risers too high", () => {
  const f = fixture()
  f.steps.risers = 3
  f.steps.going_m = 0.1
  f.steps.clear_width_m = 1
  f.steps.landing_depth_m = 0.5
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toEqual(
    expect.arrayContaining(["Entry stair riser is invalid or too high", "Entry stair going is too short", "Entry stair width does not fit the doorway", "Entry stair landing is too shallow"]),
  )
})
it("checks the stairs as occupied ground so a short setback cannot consume the street", () => {
  const f = fixture(),
    geometry = entryStepGeometry({ building: f.building, documents: f.documents, steps: f.steps, metres: 1 })!
  expect(
    auditSiteBounds({
      bounds: geometry.bounds,
      building: f.building,
      houses: [],
      roads: [
        {
          pts: [
            [0, 10],
            [15, 10],
          ],
          w: 1,
        },
      ],
      mapTiles: 16,
      label: "Entry stair footprint",
    }),
  ).toContain("Entry stair footprint covers road 1")
})
it("rejects a foreign doorway, absent foundation and duplicate entries without rewriting the plan", () => {
  const f = fixture(),
    before = JSON.stringify(f.building)
  f.room.building = "other"
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Entry stair has no matching foundation and exterior doorway")
  expect(JSON.stringify(f.building)).toBe(before)
  f.room.building = f.building.id
  ;(f.building.entry_steps as EntrySteps[]).push({ ...f.steps })
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Duplicate exterior stair at doorway")
  delete f.building.foundation
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Entry stair has no matching foundation and exterior doorway")
})

it("cannot replace a climb with a route that bypasses the landing or leaves the stairs sideways", () => {
  const f = fixture(),
    site = f.building.site_plan as { approaches: { width_m: number; points_tiles: number[][] }[] }
  site.approaches[0].points_tiles = [
    [6.5, 8],
    [7.5, 10],
    [6.5, 11.4],
    [6.5, 12],
  ]
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Entry stair approach leaves or reverses its stair centre line")
  site.approaches[0].points_tiles = [
    [6.5, 8],
    [6.5, 12],
  ]
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Entry stair approach does not connect its lower landing")
  site.approaches[0].points_tiles = [
    [6.5, 8],
    [6.5, 11.4],
    [6.5, 12],
  ]
  site.approaches[0].width_m = 1
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 })).toContain("Entry stair approach is wider than its clear passage")
})

it.each([undefined, 1.8, "2", Infinity, 2.5])("rejects an entrance without usable standing headroom before rendering: %s", (height) => {
  const f = fixture()
  f.building.entry_opening_height_m = height
  expect(() => entryOpeningHeight(f.building)).toThrow(/Entrance height/)
  expect(auditEntrySteps({ building: f.building, documents: f.documents, terrain: f.terrain, metres: 1 }).some((error) => /Entrance height/.test(error))).toBe(true)
})

it("rejects a stair outside the sampled terrain instead of accepting a clamped flat boundary", () => {
  const source = fixture()
  const terrain = new ScalarField(new Float32Array(9), 3)
  expect(auditEntrySteps({ building: source.building, documents: source.documents, terrain: terrain, metres: 1 })).toContain("Entry stair footprint exceeds sampled terrain")
})

it("refuses non-finite dimensions before constructing a stair instead of losing the comparison to NaN", () => {
  const source = fixture()
  source.steps.going_m = NaN
  expect(auditEntrySteps({ building: source.building, documents: source.documents, terrain: source.terrain, metres: 1 })).toEqual(["Invalid exterior stair dimensions"])
})

it("does not construct non-finite stair geometry from an invalid site or foundation", () => {
  for (const changes of [
    { foundation: { floor_elevation_m: NaN, floor_thickness_m: 0.2, minimum_ground_gap_m: 0.1 } },
    { layout: { width: Infinity, depth: 6, cell_m: 0.5 } },
    { site_plan: { origin: [NaN, 5], rotation_quarters: 0 } },
  ]) {
    const source = fixture()
    Object.assign(source.building, changes)
    expect(entryStepGeometry({ building: source.building, documents: source.documents, steps: source.steps, metres: 1 })).toBeUndefined()
  }
})

it("rejects arithmetic overflow even when individual elevation values are finite", () => {
  const source = fixture()
  source.building.foundation = { floor_elevation_m: 1.7e308, floor_thickness_m: 0.2, minimum_ground_gap_m: 0.1 }
  source.steps.lower_elevation_m = -1.7e308
  expect(entryStepGeometry({ building: source.building, documents: source.documents, steps: source.steps, metres: 1 })).toBeUndefined()
})

it("rejects a non-finite approach point before treating the route as a connected stair", () => {
  const source = fixture()
  source.building.site_plan = {
    origin: [5, 5],
    rotation_quarters: 0,
    approaches: [
      {
        room: "room",
        door: [2, 5],
        width_m: 0.9,
        points_tiles: [
          [6.5, 8],
          [NaN, 10],
          [6.5, 11.4],
          [6.5, 12],
        ],
      },
    ],
  }
  expect(auditEntrySteps({ building: source.building, documents: source.documents, terrain: source.terrain, metres: 1 })).toContain("Invalid exterior stair approach")
})
