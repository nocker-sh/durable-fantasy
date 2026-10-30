import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditTransportLoads } from "./transport-load"
const base = (id: string, kind: string): SettingDocument => ({ id, kind, title: id, status: "設計中", design_gate: "未通過", source: "test", issues: [] })
function fixture() {
  const carrier: SettingDocument = { ...base("resident-a", "residents"), handling_plan: { max_hand_load_kg: 12, status: "proposed", basis: "設計上限" } }
  const plan = { carrier: carrier.id, max_fill_l: 8 }
  const doc: SettingDocument = {
    ...base("room-bedroom", "rooms"),
    building: "building-home",
    grid: { cell_m: 0.5, rows: ["####", "#N.#", "#..#", "####"] },
    private_for: [carrier.id],
    material_routes: [{ to: "facility-treatment", container_symbol: "N", carry_plan: plan }],
    furniture: [
      {
        symbol: "N",
        name: "容器の台",
        source: "陶工",
        owner: "世帯",
        rect: [1, 1, 1, 1],
        access: [[2, 1]],
        transport_container: {
          id: "container-night",
          stream: "excreta",
          material: "ceramic",
          shape: "cylinder",
          lidded: true,
          outer_diameter_m: 0.3,
          outer_height_m: 0.4,
          inner_diameter_m: 0.28,
          usable_depth_m: 0.3,
          capacity_l: 10,
          empty_mass_kg: 2,
        },
      },
    ],
  }
  const target: SettingDocument = { ...base("facility-treatment", "facilities"), caretakers: [carrier.id] }
  const owner: SettingDocument = { ...base("building-home", "buildings"), residents: [carrier.id, "resident-b"] }
  const docs = new Map([doc, carrier, target, owner, base("resident-b", "residents")].map((d) => [d.id, d]))
  return { doc, docs, carrier, target, owner, plan, audit: () => auditTransportLoads(docs) }
}
it("checks the operating fill against a proposed caretaker load without certifying ability", () => {
  expect(fixture().audit()).toEqual([])
})
it("includes the empty container in the carried mass", () => {
  const f = fixture()
  f.doc.furniture![0].transport_container!.empty_mass_kg = 5
  expect(f.audit()).toContain("room-bedroom: filled vessel exceeds the carrier's planned hand load")
})
it.each([0, 11, Infinity])("rejects an invalid operating fill %s", (fill) => {
  const f = fixture()
  f.plan.max_fill_l = fill
  expect(f.audit()).toContain("room-bedroom: operating fill exceeds vessel capacity or is invalid")
})
it("requires an assigned household caretaker and permission to enter the private room", () => {
  const f = fixture()
  f.target.caretakers = []
  expect(f.audit()).toContain("room-bedroom: carrier is not a responsible household caretaker")
  f.target.caretakers = [f.carrier.id]
  f.doc.private_for = ["resident-b"]
  expect(f.audit()).toContain("room-bedroom: carrier cannot enter the source room")
})
it("does not claim a proposed personal limit as completed design", () => {
  const f = fixture()
  f.doc.design_gate = "通過"
  expect(f.audit()).toContain("room-bedroom: carrier handling limit is still proposed")
  expect(f.audit()).toContain("room-bedroom: carrier design has not passed")
})
it("requires a placed vessel and an actual handling profile", () => {
  const f = fixture()
  f.doc.furniture = []
  expect(f.audit()).toContain("room-bedroom: carrying plan has no placed vessel")
  delete f.carrier.handling_plan
  expect(f.audit()).toContain("room-bedroom: carrier has no usable handling limit")
})
it("does not accept unknown density models or an invalid empty mass", () => {
  const f = fixture(),
    vessel = f.doc.furniture![0].transport_container!
  vessel.stream = "unknown"
  expect(f.audit()).toContain("room-bedroom: container has no planning density model")
  vessel.stream = "excreta"
  vessel.empty_mass_kg = NaN
  expect(f.audit()).toContain("room-bedroom: container has no valid empty mass")
})
it("does not pass transport without a carrying plan", () => {
  const f = fixture()
  f.doc.material_routes = [{ to: f.target.id, container_symbol: "N" }]
  f.doc.design_gate = "通過"
  expect(f.audit()).toContain("room-bedroom: transport has no carrying plan")
})
