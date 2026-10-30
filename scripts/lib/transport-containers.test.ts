import { expect, it } from "vitest"
import type { SettingDocument, TransportContainer } from "#/scripts/lib/setting-document"
import { auditTransportContainers } from "#/scripts/lib/transport-containers"
function fixture() {
  const vessel: TransportContainer = {
    id: "container-night",
    stream: "excreta",
    shape: "cylinder",
    material: "glazed_ceramic",
    lidded: true,
    outer_diameter_m: 0.3,
    outer_height_m: 0.4,
    inner_diameter_m: 0.28,
    usable_depth_m: 0.3,
    capacity_l: 18,
    empty_mass_kg: 2,
  }
  const doc: SettingDocument = {
    id: "room-bedroom",
    kind: "rooms",
    title: "寝室",
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: [],
    grid: { cell_m: 0.5, rows: ["####", "#C.#", "#..#", "####"] },
    furniture: [{ symbol: "C", name: "夜間容器の台", owner: "世帯", source: "陶工と木工所", rect: [1, 1, 1, 1], access: [[2, 1]], transport_container: vessel }],
  }
  const docs = new Map([[doc.id, doc]])
  return { doc, docs, vessel, audit: () => auditTransportContainers(docs) }
}
it("checks a placed lidded vessel without treating its plan as an actual carrying test", () => {
  expect(fixture().audit()).toEqual([])
})
it("rejects capacity above the internal cylindrical volume", () => {
  const f = fixture()
  f.vessel.capacity_l = 20
  expect(f.audit()).toContain("room-bedroom: container-night: capacity exceeds the vessel's internal volume")
})
it("requires wall and base space and keeps the outer diameter inside the holder", () => {
  const f = fixture()
  f.vessel.inner_diameter_m = 0.31
  f.vessel.outer_diameter_m = 0.6
  expect(f.audit()).toContain("room-bedroom: container-night: container does not fit its furniture footprint")
  f.vessel.outer_diameter_m = 0.3
  f.vessel.usable_depth_m = 0.4
  expect(f.audit()).toContain("room-bedroom: container-night: inner dimensions leave no wall or base")
})
it("requires a lid and meaningful dimensions and empty mass", () => {
  const f = fixture()
  f.vessel.lidded = false
  expect(f.audit()).toContain("room-bedroom: container-night: waste container has no lid")
  f.vessel.empty_mass_kg = NaN
  expect(f.audit()).toContain("room-bedroom: container-night: invalid container dimensions or mass")
})
it("does not count the same physical container in two rooms", () => {
  const f = fixture()
  f.docs.set("room-other", { ...structuredClone(f.doc), id: "room-other" })
  expect(f.audit()).toContain("room-other: container-night: duplicate transport container")
})
it("does not call an unplaced vessel a physical container", () => {
  const f = fixture()
  f.doc.grid = null
  expect(f.audit()).toContain("room-bedroom: container-night: container has no physical grid")
})

it("also requires a lid for a dedicated drinking-water vessel", () => {
  const f = fixture()
  f.vessel.stream = "potable_water"
  f.vessel.lidded = false
  expect(f.audit()).toContain("room-bedroom: container-night: drinking-water container has no lid")
})
