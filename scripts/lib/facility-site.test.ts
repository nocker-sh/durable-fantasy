import { expect, it } from "vitest"
import { auditFacilitySite } from "#/scripts/lib/facility-site"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const maps = { square: { places: { well: [1, 2] } } }
const document = (site: unknown): SettingDocument => ({ id: "facility-well", kind: "facilities", title: "井戸", source: "test", status: "設計中", design_gate: "未通過", issues: [], site })
it("checks both map and named place rather than just the presence of a document", () => {
  expect(auditFacilitySite(document({ map: "map-square", place: "well" }), maps)).toEqual([])
  expect(auditFacilitySite(document({ map: "map-square", place: "invented" }), maps)).toEqual(["Facility place does not exist on map"])
  expect(auditFacilitySite(document({ map: "map-missing", place: "well" }), maps)).toEqual(["Facility map does not exist"])
})
it("allows an explicit placement proposal without presenting it as completed", () => {
  const doc = document({ map: "map-square", status: "proposed" })
  expect(auditFacilitySite(doc, maps)).toEqual([])
  doc.design_gate = "通過"
  expect(auditFacilitySite(doc, maps)).toEqual(["Unresolved facility placement cannot pass design gate"])
})
it("rejects malformed or reversed outdoor equipment footprints", () => {
  expect(auditFacilitySite(document({ map: "map-square", place: "well", occupied_rect_tiles: [2, 3, 1, 4] }), maps)).toEqual(["Invalid facility footprint"])
})
