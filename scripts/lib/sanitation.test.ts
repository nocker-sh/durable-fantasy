import { expect, it } from "vitest"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import { auditSanitation } from "#/scripts/lib/sanitation"
const base = (id: string, kind = "facilities"): SettingDocument => ({ id, kind, title: id, source: "test", status: "設計中", design_gate: "未通過", issues: [] })
const route = (stream: string, to: string, container_id: string) => ({ stream, to, container_id, container_symbol: null as string | null, status: "proposed" })
function fixture() {
  const owner = { ...base("building-home", "buildings"), residents: ["resident-a"], facilities: ["facility-privy", "facility-treatment", "facility-plot"] }
  const privy = {
    ...base("facility-privy"),
    owner_building: owner.id,
    caretakers: ["resident-a"],
    sanitation_role: "privy",
    material_routes: [route("excreta", "facility-treatment", "excreta-container")],
  }
  const kitchen = { ...base("room-kitchen", "rooms"), building: owner.id, material_routes: [route("greywater", "facility-treatment", "greywater-container")] }
  const treatment = {
    ...base("facility-treatment"),
    owner_building: owner.id,
    caretakers: ["resident-a"],
    sanitation_role: "treatment",
    accepts_streams: ["excreta", "greywater"],
    material_routes: [route("treated_residue", "facility-plot", "solid-container"), route("treated_water", "facility-plot", "water-container")],
  }
  const plot = { ...base("facility-plot"), owner_building: owner.id, caretakers: ["resident-a"], sanitation_role: "nonfood_planting", accepts_streams: ["treated_residue", "treated_water"] }
  const docs = new Map<string, SettingDocument>([owner, privy, kitchen, treatment, plot, base("resident-a", "residents")].map((doc) => [doc.id, doc]))
  return { docs, owner, privy, kitchen, treatment, plot, audit: () => auditSanitation(docs) }
}
it("traces separate household streams to treatment and a nonfood destination", () => {
  expect(fixture().audit()).toEqual([])
})
it("does not send untreated material straight to a plot even if its metadata says it accepts it", () => {
  const f = fixture()
  f.privy.material_routes[0].to = f.plot.id
  f.plot.accepts_streams.push("excreta")
  expect(f.audit()).toContain("facility-privy: waste stream has no compatible destination")
})
it("does not relabel kitchen waste as treated without a treatment source", () => {
  const f = fixture()
  f.kitchen.material_routes[0] = route("treated_water", f.plot.id, "greywater-container")
  expect(f.audit()).toContain("room-kitchen: treated output has no treatment source")
})
it("requires an owner and people to maintain the equipment", () => {
  const f = fixture()
  f.owner.facilities = []
  f.privy.caretakers = []
  expect(f.audit()).toContain("facility-privy: sanitation facility has no reciprocal household owner")
  expect(f.audit()).toContain("facility-privy: sanitation maintenance has no household caretaker")
})
it("does not reuse transport containers across streams", () => {
  const f = fixture()
  f.kitchen.material_routes[0].container_id = "excreta-container"
  expect(f.audit()).toContain("room-kitchen: transport container is shared between waste routes")
})
it("does not hide a missing output or move private waste into another household", () => {
  const f = fixture()
  f.treatment.material_routes = []
  f.treatment.owner_building = "building-other"
  expect(f.audit()).toContain("facility-treatment: treatment has an incomplete output plan")
  expect(f.audit()).toContain("facility-privy: private waste route changes household ownership")
})
it("keeps proposed routes from passing the design gate", () => {
  const f = fixture()
  f.privy.design_gate = "通過"
  expect(f.audit()).toContain("facility-privy: waste route is still proposed")
})

it("requires a route's placed container to match both identity and contents", () => {
  const f = fixture()
  f.privy.material_routes[0].container_symbol = "B"
  expect(f.audit()).toContain("facility-privy: waste route has no matching placed container")
})
it("does not pass a route whose container still has only an ID", () => {
  const f = fixture()
  f.privy.design_gate = "通過"
  f.privy.material_routes[0].status = "designed"
  expect(f.audit()).toContain("facility-privy: waste container has no physical placement")
})
it("accepts a matching physical container and detects changing its identity or contents", () => {
  const f = fixture(),
    doc = f.docs.get(f.privy.id)!
  doc.grid = { cell_m: 0.5, rows: ["####", "#B.#", "#..#", "####"] }
  doc.furniture = [
    {
      symbol: "B",
      name: "受け容器",
      owner: "世帯",
      source: "陶工",
      rect: [1, 1, 1, 1],
      access: [[2, 1]],
      transport_container: {
        id: "excreta-container",
        stream: "excreta",
        shape: "cylinder",
        material: "ceramic",
        lidded: true,
        outer_diameter_m: 0.3,
        outer_height_m: 0.4,
        inner_diameter_m: 0.28,
        usable_depth_m: 0.3,
        capacity_l: 10,
        empty_mass_kg: 2,
      },
    },
  ]
  f.privy.material_routes[0].container_symbol = "B"
  expect(f.audit()).toEqual([])
  doc.furniture[0].transport_container!.stream = "greywater"
  expect(f.audit()).toContain("facility-privy: waste route has no matching placed container")
  doc.furniture[0].transport_container!.stream = "excreta"
  doc.furniture[0].transport_container!.id = "other-container"
  expect(f.audit()).toContain("facility-privy: waste route has no matching placed container")
})
