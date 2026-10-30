import { expect, it } from "vitest"
import { auditSettingReferenceTypes } from "./setting-reference-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const doc = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", source: "test", design_gate: "未通過", issues: [] })
function fixture() {
  const room = { ...doc("room-a", "rooms"), town: "town-a", building: "building-a", private_for: ["resident-a"], connections: [{ target: "map-a" }] }
  const building = { ...doc("building-a", "buildings"), town: "town-a", map: "map-a", rooms: [room.id], residents: ["resident-a"] }
  const documents = new Map<string, SettingDocument>([room, building, doc("town-a", "towns"), doc("map-a", "maps"), doc("resident-a", "residents"), doc("monster-a", "monsters")].map((d) => [d.id, d]))
  return { room, building, documents }
}
it("accepts the entity kinds used by the declared relationship fields", () => {
  expect(auditSettingReferenceTypes(fixture().documents)).toEqual([])
})
it("distinguishes an outdoor map outside a town from an invalid null parent", () => {
  const f = fixture()
  f.documents.get("map-a")!.town = null
  expect(auditSettingReferenceTypes(f.documents)).toEqual([])
  f.documents.get("room-a")!.town = null
  expect(auditSettingReferenceTypes(f.documents)).toContain("room-a: invalid reference at town")
})
it("rejects an existing resident used as a room's building", () => {
  const f = fixture()
  f.room.building = "resident-a"
  expect(auditSettingReferenceTypes(f.documents)).toContain("room-a: building refers to residents, expected buildings")
})
it("does not accept a monster in a building's resident list", () => {
  const f = fixture()
  f.building.residents = ["monster-a"]
  expect(auditSettingReferenceTypes(f.documents)).toContain("building-a: residents[0] refers to monsters, expected residents")
})
it("accepts map and room connections but rejects other target kinds", () => {
  const f = fixture()
  f.room.connections = [{ target: "room-a" }]
  expect(auditSettingReferenceTypes(f.documents)).toEqual([])
  f.room.connections[0].target = "building-a"
  expect(auditSettingReferenceTypes(f.documents)).toContain("room-a: connections[0].target refers to buildings, expected rooms or maps")
})
it("checks resident and map references nested inside authored structures", () => {
  const f = fixture()
  f.documents.get("room-a")!.sleeping_places = [{ resident: "map-a" }]
  f.documents.set("facility-a", { ...doc("facility-a", "facilities"), site: { map: "town-a" }, users: ["room-a"] })
  const errors = auditSettingReferenceTypes(f.documents)
  expect(errors).toContain("room-a: sleeping_places[0].resident refers to maps, expected residents")
  expect(errors).toContain("facility-a: site.map refers to towns, expected maps")
  expect(errors).toContain("facility-a: users[0] refers to rooms, expected residents")
})
it("rejects unresolved IDs even when a typo no longer has a recognised ID prefix", () => {
  const f = fixture()
  f.room.building = "missingHouse"
  expect(auditSettingReferenceTypes(f.documents)).toContain("room-a: unresolved reference at building")
})
it("leaves custom metadata intact and does not fill in absent relationships", () => {
  const f = fixture()
  f.documents.get("room-a")!.custom_detail = { preserved: true }
  const before = JSON.stringify([...f.documents.entries()])
  expect(auditSettingReferenceTypes(f.documents)).toEqual([])
  expect(JSON.stringify([...f.documents.entries()])).toBe(before)
})

it("allows a communal room's resident users without treating them as building staff", () => {
  const source = fixture(),
    room = source.documents.get("room-a")
  if (!room) throw new Error("Missing room fixture")
  room.users = ["resident-a"]
  expect(auditSettingReferenceTypes(source.documents)).toEqual([])
  room.users = ["monster-a"]
  expect(auditSettingReferenceTypes(source.documents)).toContain("room-a: users[0] refers to monsters, expected residents")
})
