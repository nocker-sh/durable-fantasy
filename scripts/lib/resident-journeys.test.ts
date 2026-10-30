import { expect, it } from "vitest"
import { auditResidentJourneys, type JourneyMap } from "./resident-journeys"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
function fixture() {
  const actor = {
    ...base("resident-a", "residents"),
    outdoor_journeys: [
      {
        map: "map-town",
        activity: "洗濯",
        from: { document: "building-a", room: "room-a", door: [7, 3] },
        to_facility: "facility-wash",
        arrival: "upper-landing",
        width_m: 1,
        points_tiles: [
          [4, 2],
          [6, 2],
          [6, 5],
        ],
        status: "proposed",
      },
    ],
  }
  const home = {
    ...base("building-a", "buildings"),
    residents: [actor.id],
    map: "map-town",
    rooms: ["room-a"],
    layout: { cell_m: 0.5, width: 8, depth: 8 },
    site_plan: { origin: [0, 0], rotation_quarters: 0 },
  }
  const room = {
    ...base("room-a", "rooms"),
    building: home.id,
    floor: 0,
    origin: [0, 0],
    grid: { cell_m: 0.5, rows: ["########", "#......#", "#......#", "#......D", "#......D", "#......#", "#......#", "########"] },
    connections: [{ target: "map-town", door: [7, 3], width_cells: 2 }],
  }
  const target = { ...base("facility-wash", "facilities"), users: [actor.id], site: { map: "map-town", place: "washing" } }
  const documents = new Map<string, SettingDocument>([actor, home, room, target].map((d) => [d.id, d]))
  const map: JourneyMap = {
    ground: {
      map_tiles: 20,
      metres_per_tile: 1,
      water: {
        points: [
          [-99, -99],
          [-98, -99],
        ],
        half_width: 0,
      },
      bridges: [],
      obstacles: [],
    },
    arrivals: new Map([["upper-landing", { facility: target.id, place: "washing", point: [6, 5], width_m: 1.5 }]]),
  }
  const maps = new Map([["map-town", map]])
  const check = () => auditResidentJourneys(actor, documents, maps)
  return { actor, home, room, target, map, maps, check, journey: actor.outdoor_journeys[0] }
}
it("binds a resident's home door to the registered workplace arrival", () => {
  expect(fixture().check()).toEqual([])
})
it("rejects a home or workplace belonging to someone else", () => {
  const f = fixture()
  f.home.residents = []
  expect(f.check()).toContain("resident-a/洗濯: Journey actor does not belong to its home or workplace")
  f.home.residents = [f.actor.id]
  f.target.users = []
  expect(f.check()).toContain("resident-a/洗濯: Journey actor does not belong to its home or workplace")
})
it("does not accept an arrival registration for a different place or map", () => {
  const f = fixture()
  f.target.site.place = "other"
  expect(f.check()).toContain("resident-a/洗濯: Journey endpoints have no matching home and arrival feature")
  f.target.site.place = "washing"
  f.journey.map = "map-unknown"
  expect(f.check()).toContain("resident-a/洗濯: Journey endpoints have no matching home and arrival feature")
})
it("requires both exact endpoints after the house moves", () => {
  const f = fixture()
  f.home.site_plan.origin = [1, 0]
  expect(f.check()).toContain("resident-a/洗濯: Journey does not join its exact home door and arrival feature")
  f.home.site_plan.origin = [0, 0]
  f.journey.points_tiles[2] = [6, 5.1]
  expect(f.check()).toContain("resident-a/洗濯: Journey does not join its exact home door and arrival feature")
})
it("checks departure direction and both endpoint widths", () => {
  const f = fixture()
  f.journey.points_tiles[1] = [3, 2]
  expect(f.check()).toContain("resident-a/洗濯: Journey does not leave its doorway outward")
  f.journey.points_tiles[1] = [6, 2]
  f.journey.width_m = 2
  expect(f.check()).toContain("resident-a/洗濯: Journey is wider than the home door")
  expect(f.check()).toContain("resident-a/洗濯: Journey is wider than the arrival stairs")
})
it("does not certify a proposed journey or crash on an empty path", () => {
  const f = fixture()
  f.actor.design_gate = "通過"
  expect(f.check()).toContain("resident-a/洗濯: Journey is still proposed")
  f.journey.points_tiles = []
  expect(f.check()).toContain("resident-a/洗濯: Invalid journey width or points")
})
it("still applies the physical ground audit after the relationships pass", () => {
  const f = fixture()
  f.map.ground.obstacles = [{ id: "field", rect: [5, 1, 7, 3] }]
  expect(f.check()).toContain("resident-a/洗濯: Journey crosses field")
})
it("does not let an invalid registered arrival bypass endpoint comparisons", () => {
  const f = fixture()
  f.map.arrivals = new Map([["upper-landing", { facility: f.target.id, place: "washing", point: [NaN, 5], width_m: 1.5 }]])
  expect(f.check()).toContain("resident-a/洗濯: Journey endpoints have no matching home and arrival feature")
})
