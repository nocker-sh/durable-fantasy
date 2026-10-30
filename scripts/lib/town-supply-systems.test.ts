import { expect, it } from "vitest"
import { auditTownSupplySystems } from "#/scripts/lib/audit-town-supply-systems"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const document = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [], town: "town-test" })
const fixture = () => {
  const system = {
    id: "flour",
    resource: "麦と粉",
    sources: ["building-farm"],
    processing: ["facility-mill"],
    destinations: ["room-kitchen"],
    handlers: ["resident-farmer"],
    unresolved: ["製粉と運搬は未設計"],
  }
  const town = { ...document("town-test", "towns"), supply_systems: [system] }
  const documents = new Map(
    [document("building-farm", "buildings"), document("facility-mill", "facilities"), document("room-kitchen", "rooms"), document("resident-farmer", "residents")].map((entry) => [entry.id, entry]),
  )
  return { town, documents, system }
}
it("connects a proposed supply without changing its documents or approving operation", () => {
  const props = fixture(),
    before = JSON.stringify([props.town, [...props.documents]])
  expect(auditTownSupplySystems(props)).toEqual([])
  expect(props.town.design_gate).toBe("未通過")
  expect(JSON.stringify([props.town, [...props.documents]])).toBe(before)
})
it("refuses known IDs in the wrong roles, missing sources and another town's processor", () => {
  const props = fixture()
  props.system.handlers = ["facility-mill"]
  expect(auditTownSupplySystems(props)).toContain("town-test: flour: invalid handlers reference facility-mill")
  props.system.handlers = ["resident-farmer"]
  props.system.sources = ["building-missing"]
  expect(auditTownSupplySystems(props)).toContain("town-test: flour: invalid sources reference building-missing")
  props.system.sources = ["building-farm"]
  const mill = props.documents.get("facility-mill")
  if (!mill) throw new Error("Missing fixture mill")
  mill.town = "town-other"
  expect(auditTownSupplySystems(props)).toContain("town-test: flour: processing reference belongs to another town: facility-mill")
})
it("refuses duplicated supply IDs and repeated participants within a role", () => {
  const props = fixture()
  props.town.supply_systems.push({ ...props.system })
  expect(auditTownSupplySystems(props)).toContain("town-test: Supply system IDs are duplicated")
  props.system.handlers.push("resident-farmer")
  expect(auditTownSupplySystems(props)).toContain("town-test: flour: duplicate handlers reference")
})
it("retains unresolved work and proposed dependencies when the town gate is claimed", () => {
  const props = fixture()
  props.town.design_gate = "通過"
  expect(auditTownSupplySystems(props)).toContain("town-test: flour: unresolved supply cannot clear the town design gate")
  props.system.unresolved = []
  expect(auditTownSupplySystems(props)).toContain("town-test: flour: unresolved processing reference facility-mill")
  for (const entry of props.documents.values()) entry.design_gate = "通過"
  expect(auditTownSupplySystems(props)).toEqual([])
})
it("rejects malformed or absent inventories without filling in missing supply data", () => {
  const props = fixture()
  props.system.resource = " "
  expect(auditTownSupplySystems(props)).toEqual(["town-test: Invalid town supply systems"])
  const town = document("town-test", "towns")
  expect(auditTownSupplySystems({ ...props, town })).toEqual([])
  town.design_gate = "通過"
  expect(auditTownSupplySystems({ ...props, town })).toEqual(["town-test: Invalid town supply systems"])
})
