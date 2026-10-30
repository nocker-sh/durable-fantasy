import { expect, it } from "vitest"
import { plannedGardens } from "#/scripts/lib/planned-gardens"
import { auditReservedLand } from "#/scripts/lib/audit-reserved-land"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
const original = [{ x0: 2, z0: 2, x1: 5, z1: 5 }]
function fixture() {
  const garden = {
    ...base("facility-garden", "facilities"),
    ground_feature: { kind: "garden", index: 0, source_rect_tiles: [2, 2, 5, 5] },
    site: { map: "map-town", occupied_rect_tiles: [6, 6, 9, 9] },
  }
  const map = { ...base("map-town", "maps"), facilities: [garden.id] }
  return { garden, map, documents: new Map<string, SettingDocument>([garden, map].map((d) => [d.id, d])) }
}
it("keeps existing gardens when no proposal replaces them", () => {
  expect(plannedGardens(new Map(), "map-town", original)).toEqual({ errors: [], areas: [{ id: "garden-1", rect: [2, 2, 5, 5] }] })
})
it("replaces one documented plot without mutating runtime data", () => {
  const f = fixture(),
    before = structuredClone(original)
  expect(plannedGardens(f.documents, "map-town", original)).toEqual({ errors: [], areas: [{ id: f.garden.id, rect: [6, 6, 9, 9] }] })
  expect(original).toEqual(before)
  expect(plannedGardens(f.documents, "map-other", original).areas[0].rect).toEqual([2, 2, 5, 5])
})
it("does not erase a garden by shrinking the replacement", () => {
  const f = fixture()
  f.garden.site.occupied_rect_tiles = [6, 6, 8, 8]
  expect(plannedGardens(f.documents, "map-town", original).errors).toContain("facility-garden: replacement loses existing garden area")
})
it("requires the source garden and its map's facility inventory", () => {
  const f = fixture()
  f.map.facilities = []
  expect(plannedGardens(f.documents, "map-town", original).errors).toContain("facility-garden: garden is missing from its map inventory")
  f.garden.ground_feature.index = 1
  expect(plannedGardens(f.documents, "map-town", original).errors).toContain("facility-garden: garden has no matching source plot or footprint")
})
it("does not let two facilities replace the same original plot", () => {
  const f = fixture()
  f.documents.set("facility-other", { ...f.garden, id: "facility-other" })
  expect(plannedGardens(f.documents, "map-town", original).errors).toContain("facility-other: source garden is replaced more than once")
})
it("checks roof or wall bounds against the full reserved rectangle", () => {
  const areas = [{ id: "pasture", rect: [3, 3, 7, 7] as const }]
  expect(auditReservedLand({ id: "building-home", bounds: [2, 2, 3.1, 4], paths: [], areas: areas, metres: 1 })).toContain("Footprint covers reserved land pasture")
  expect(auditReservedLand({ id: "building-home", bounds: [1, 1, 3, 3], paths: [], areas: areas, metres: 1 })).toEqual([])
})
it("checks passage width and the middle of a crossing path", () => {
  const areas = [{ id: "field", rect: [3, 3, 7, 7] as const }]
  expect(
    auditReservedLand({
      id: "building-home",
      bounds: undefined,
      paths: [
        {
          width_m: 1,
          points_tiles: [
            [0, 2.7],
            [10, 2.7],
          ],
        },
      ],
      areas: areas,
      metres: 1,
    }),
  ).toContain("Access crosses reserved land field")
  expect(
    auditReservedLand({
      id: "building-home",
      bounds: undefined,
      paths: [
        {
          width_m: 1,
          points_tiles: [
            [0, 5],
            [10, 5],
          ],
        },
      ],
      areas: areas,
      metres: 1,
    }),
  ).toContain("Access crosses reserved land field")
})
it("does not treat a garden's own footprint as a conflict with itself", () => {
  expect(auditReservedLand({ id: "facility-garden", bounds: [2, 2, 5, 5], paths: [], areas: [{ id: "facility-garden", rect: [2, 2, 5, 5] }], metres: 1 })).toEqual([])
})

it("does not silently bind a proposal to a different source plot after layout edits", () => {
  const f = fixture()
  const result = plannedGardens(f.documents, "map-town", [{ x0: 1, z0: 1, x1: 4, z1: 4 }])
  expect(result.errors).toContain("facility-garden: source garden geometry changed")
  expect(result.areas[0].rect).toEqual([1, 1, 4, 4])
})
it("recognizes a building's own parts while reserving them against other buildings", () => {
  const areas = [{ id: "building-chapel/tower", rect: [5.48, 3.68, 8.12, 6.32] as const }]
  expect(auditReservedLand({ id: "building-chapel", bounds: [5.5, 4, 6, 5], paths: [], areas: areas, metres: 1 })).toEqual([])
  expect(auditReservedLand({ id: "building-other", bounds: [5.5, 4, 6, 5], paths: [], areas: areas, metres: 1 })).toContain("Footprint covers reserved land building-chapel/tower")
  expect(auditReservedLand({ id: "building-chapel-other", bounds: [5.5, 4, 6, 5], paths: [], areas: areas, metres: 1 })).toContain("Footprint covers reserved land building-chapel/tower")
})
