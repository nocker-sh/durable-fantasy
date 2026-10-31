import { expect, it } from "vitest"
import { auditBuildingFloors } from "#/scripts/lib/audit-building-floors"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Layout } from "#/scripts/lib/building-layout"

function fixture() {
  const building: SettingDocument = { id: "building", kind: "buildings", title: "building", source: "test", status: "設計中", design_gate: "未通過", issues: [] }
  const layout: Layout = { cell_m: 1, width: 1, depth: 1, floors: [{ floor: 0, rooms: ["unresolved"] }] }
  return { building, documents: new Map<string, SettingDocument>(), layout, roomIds: ["unresolved"] }
}
it("retains an unresolved room's registration while reporting its missing geometry", () => {
  const request = fixture(),
    original = structuredClone(request)
  const floors = auditBuildingFloors(request)
  expect(floors.placed).toEqual(new Set(["unresolved"]))
  expect(floors.errors).toEqual(["unresolved: missing grid or wrong building/floor", "Floor 0: unassigned building cells"])
  expect(request).toEqual(original)
})
it("does not merge rooms from duplicate floor definitions into the accepted floor", () => {
  const request = fixture()
  request.layout.floors.push({ floor: 0, rooms: ["skipped"] })
  request.roomIds.push("skipped")
  const floors = auditBuildingFloors(request)
  expect(floors.placed).toEqual(new Set(["unresolved"]))
  expect(floors.errors).toContain("Duplicate or invalid floor")
  expect(floors.errors).toContain("skipped: not placed on a floor")
})
it("detects duplicate registration across floors and inventory omissions independently", () => {
  const request = fixture()
  request.layout.floors.push({ floor: 1, rooms: ["unresolved"] })
  request.roomIds.length = 0
  const floors = auditBuildingFloors(request)
  expect(floors.errors).toContain("unresolved: room occurs more than once")
  expect(floors.errors).toContain("unresolved: floor room missing from building inventory")
})
it("does not assign rooms to a fractional floor", () => {
  const request = fixture()
  request.layout.floors[0].floor = 0.5
  const floors = auditBuildingFloors(request)
  expect(floors.placed.size).toBe(0)
  expect(floors.errors).toEqual(["Duplicate or invalid floor", "unresolved: not placed on a floor"])
})
