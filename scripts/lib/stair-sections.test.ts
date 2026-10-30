import { expect, it } from "vitest"
import { auditStairSections } from "#/scripts/lib/stair-sections"
import type { SettingDocument } from "#/scripts/lib/setting-document"
function fixture() {
  const common = {
    kind: "rooms",
    title: "部屋",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    building: "building-a",
    grid: { cell_m: 0.5, rows: ["########", ...Array(12).fill("#SS....#"), "########"] },
  }
  const furniture = (access: number[]) => [{ symbol: "S", name: "階段", owner: "世帯", source: "大工", rect: [1, 1, 2, 12], access: [access] }]
  const lower = {
    ...common,
    id: "room-lower",
    floor: 0,
    furniture: furniture([3, 12]),
    connections: [{ kind: "stair", target: "room-upper", furniture: "S", target_furniture: "S", access: [3, 12], target_access: [3, 1] }],
  }
  const upper = {
    ...common,
    id: "room-upper",
    floor: 1,
    furniture: furniture([3, 1]),
    connections: [{ kind: "stair", target: "room-lower", furniture: "S", target_furniture: "S", access: [3, 1], target_access: [3, 12] }],
  }
  const building = {
    id: "building-a",
    kind: "buildings",
    title: "家",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    rooms: [lower.id, upper.id],
    floor_levels: [
      { floor: 0, elevation_m: 0, ceiling_elevation_m: null as number | null },
      { floor: 1, elevation_m: 2.52, ceiling_elevation_m: null as number | null },
    ],
    stair_sections: [
      {
        lower_room: lower.id,
        upper_room: upper.id,
        furniture: "S",
        risers: 14,
        going_m: 0.28,
        axis: "y",
        lower_end: "end",
        landing_depth_m: 1,
        clear_width_m: 0.9,
        rail_inset_m: 0.05,
        opening_length_m: null as number | null,
      },
    ],
  }
  const documents = new Map<string, SettingDocument>([
    [lower.id, lower],
    [upper.id, upper],
  ])
  return { building, lower, upper, documents, section: building.stair_sections[0] }
}
it("fits a straight stair's treads and both landings without claiming headroom is verified", () => {
  const f = fixture()
  expect(auditStairSections(f.building, f.documents)).toEqual([])
})
it("rejects the old short rectangle even though both floors show the same stair", () => {
  const f = fixture()
  f.lower.furniture[0].rect[3] = 5
  f.upper.furniture[0].rect[3] = 5
  expect(auditStairSections(f.building, f.documents)).toContain("Stair run and landings do not fit its footprint")
})
it("checks rise, tread depth and usable width independently", () => {
  const f = fixture()
  f.section.risers = 10
  f.section.going_m = 0.2
  f.section.clear_width_m = 1.2
  const errors = auditStairSections(f.building, f.documents)
  expect(errors).toContain("Stair riser is too high")
  expect(errors).toContain("Stair going is too short")
  expect(errors).toContain("Stair clear width does not fit its footprint")
})
it("requires adequate landings at opposite ends", () => {
  const f = fixture()
  f.section.landing_depth_m = 0.5
  expect(auditStairSections(f.building, f.documents)).toContain("Stair landing is shallower than its clear width")
  f.section.landing_depth_m = 1
  f.section.lower_end = "start"
  expect(auditStairSections(f.building, f.documents)).toContain("Stair access does not meet its end landing")
})
it("uses each room's local coordinates for its landing", () => {
  const f = fixture()
  f.upper.furniture[0].rect[1] = 10
  f.lower.connections[0].target_access = [3, 10]
  expect(auditStairSections(f.building, f.documents)).toEqual([])
})
it("requires matching increasing floor elevations", () => {
  const f = fixture()
  f.building.floor_levels[1].elevation_m = 0
  expect(auditStairSections(f.building, f.documents)).toContain("Stair section has no increasing floor elevations")
})
it("requires a known headroom and a section for every stair before a building can pass", () => {
  const f = fixture()
  f.building.design_gate = "通過"
  expect(auditStairSections(f.building, f.documents)).toContain("Stair headroom is not established")
  f.section.opening_length_m = 3.64
  f.building.floor_levels[0].ceiling_elevation_m = 2.32
  f.building.floor_levels[1].ceiling_elevation_m = 2.52 + 1.8
  expect(auditStairSections(f.building, f.documents)).toContain("Stair headroom is not established")
  f.building.floor_levels[1].ceiling_elevation_m = 2.52 + 2
  expect(auditStairSections(f.building, f.documents)).toEqual([])
  f.building.stair_sections = []
  expect(auditStairSections(f.building, f.documents)).toContain("Stair has no designed section")
})

it("reserves the rail thickness instead of counting the entire stair width as usable", () => {
  const f = fixture()
  f.section.clear_width_m = 1
  expect(auditStairSections(f.building, f.documents)).toContain("Stair clear width does not fit its footprint")
})
