import { expect, it } from "vitest"
import { auditDesignDependencies } from "./design-dependencies"
import type { SettingDocument } from "#/scripts/lib/setting-document"
const doc = (id: string, passed = false): SettingDocument => ({
  id,
  kind: "rooms",
  title: id,
  source: "test",
  status: passed ? "設計済み" : "設計中",
  design_gate: passed ? "通過" : "未通過",
  issues: [],
  design_dependencies: [],
})
it("preserves unfinished drafts without turning a pending dependency into a completed design", () => {
  const a = doc("room-a"),
    b = doc("room-b")
  a.design_dependencies = [b.id]
  const docs = new Map([
    [a.id, a],
    [b.id, b],
  ])
  expect(auditDesignDependencies(docs)).toEqual([])
  a.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toContain("room-a: prerequisite design is unfinished: room-b")
})
it("checks each edge, permitting a mutually completed design without recursive approval", () => {
  const a = doc("room-a", true),
    b = doc("room-b", true)
  a.design_dependencies = [b.id]
  b.design_dependencies = [a.id]
  expect(
    auditDesignDependencies(
      new Map([
        [a.id, a],
        [b.id, b],
      ]),
    ),
  ).toEqual([])
})
it("rejects missing, self and duplicate dependencies", () => {
  const a = doc("room-a", true)
  a.design_dependencies = undefined
  expect(auditDesignDependencies(new Map([[a.id, a]]))).toContain("room-a: invalid or missing design dependencies")
  a.design_dependencies = [a.id, "room-missing"]
  expect(auditDesignDependencies(new Map([[a.id, a]]))).toHaveLength(2)
  a.design_dependencies = ["room-missing", "room-missing"]
  expect(auditDesignDependencies(new Map([[a.id, a]]))).toContain("room-a: invalid or missing design dependencies")
})

it("requires every journey's map, home room and destination to be explicit design prerequisites", () => {
  const actor: SettingDocument = {
    ...doc("resident-a"),
    kind: "residents",
    outdoor_journeys: [{ map: "map-town", from: { document: "building-home", room: "room-entry" }, to_facility: "facility-wash" }],
  }
  const dependencies = ["map-town", "building-home", "room-entry", "facility-wash"].map((id) => doc(id))
  const docs = new Map([actor, ...dependencies].map((d) => [d.id, d]))
  expect(auditDesignDependencies(docs)).toHaveLength(4)
  actor.design_dependencies = dependencies.map((d) => d.id)
  expect(auditDesignDependencies(docs)).toEqual([])
  actor.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toHaveLength(4)
  for (const d of dependencies) d.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toEqual([])
})
it("does not skip a draft with journeys just because its dependency list was omitted", () => {
  const actor = { ...doc("resident-a"), outdoor_journeys: [{ map: "map-town", from: { document: "building-home", room: "room-entry" }, to_facility: "facility-wash" }], design_dependencies: undefined }
  expect(auditDesignDependencies(new Map([[actor.id, actor]]))).toEqual(["resident-a: invalid or missing design dependencies"])
})

it("keeps drying handlers and the home in the room's completion prerequisites", () => {
  const room: SettingDocument = { ...doc("room-drying"), building: "building-home", laundry_drying: { racks: [{ handler: "resident-a" }], capacity_status: "unverified" } }
  const home = doc("building-home"),
    handler = doc("resident-a")
  const docs = new Map([room, home, handler].map((d) => [d.id, d]))
  expect(auditDesignDependencies(docs)).toContain("room-drying: referenced prerequisite is missing from design dependencies: resident-a")
  room.design_dependencies = [home.id, handler.id]
  room.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toContain("room-drying: prerequisite design is unfinished: resident-a")
})

it("includes a workplace's staff and common home in its completion prerequisites", () => {
  const workplace: SettingDocument = { ...doc("building-work"), kind: "buildings", workers: ["resident-a"], home_building: "building-home" }
  const home = doc("building-home"),
    worker = doc("resident-a")
  const docs = new Map([workplace, home, worker].map((d) => [d.id, d]))
  expect(auditDesignDependencies(docs)).toContain("building-work: referenced prerequisite is missing from design dependencies: building-home")
  expect(auditDesignDependencies(docs)).toContain("building-work: referenced prerequisite is missing from design dependencies: resident-a")
  workplace.design_dependencies = [home.id, worker.id]
  workplace.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toContain("building-work: prerequisite design is unfinished: building-home")
})
it("does not certify a worker while their declared work room is unfinished", () => {
  const worker: SettingDocument = { ...doc("resident-a", true), kind: "residents", work_rooms: ["room-work"], design_dependencies: ["room-work"] }
  const room = doc("room-work")
  expect(
    auditDesignDependencies(
      new Map([
        [worker.id, worker],
        [room.id, room],
      ]),
    ),
  ).toContain("resident-a: prerequisite design is unfinished: room-work")
})

it("includes the home of a stockroom and its handling worker in the completion gate", () => {
  const room: SettingDocument = { ...doc("room-store"), building: "building-work", ground_storage: [{ handler: "resident-a" }] }
  const workplace = doc("building-work"),
    worker = doc("resident-a")
  const errors = auditDesignDependencies(new Map([room, workplace, worker].map((d) => [d.id, d])))
  expect(errors).toContain("room-store: referenced prerequisite is missing from design dependencies: building-work")
  expect(errors).toContain("room-store: referenced prerequisite is missing from design dependencies: resident-a")
})

it("keeps sleeping, personal storage and dining assignments tied to their residents' designs", () => {
  const room: SettingDocument = {
    ...doc("room-home"),
    sleeping_places: [{ resident: "resident-a" }],
    personal_storage: [{ resident: "resident-b" }],
    household_meal: { seats: [{ resident: "resident-c" }] },
  }
  const residents = ["resident-a", "resident-b", "resident-c"].map((id) => ({ ...doc(id), kind: "residents" }))
  const docs = new Map<string, SettingDocument>([room, ...residents].map((d) => [d.id, d]))
  expect(auditDesignDependencies(docs)).toHaveLength(3)
  room.design_dependencies = residents.map((d) => d.id)
  expect(auditDesignDependencies(docs)).toEqual([])
  room.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toHaveLength(3)
  for (const resident of residents) resident.design_gate = "通過"
  expect(auditDesignDependencies(docs)).toEqual([])
})

it("keeps a shared room's proposed users inside its design gate without assigning employment", () => {
  const room = doc("room-a"),
    user = { ...doc("resident-a"), kind: "residents" },
    documents = new Map([
      [room.id, room],
      [user.id, user],
    ])
  room.users = [user.id]
  expect(auditDesignDependencies(documents)).toContain("room-a: referenced prerequisite is missing from design dependencies: resident-a")
  room.design_dependencies = [user.id]
  expect(auditDesignDependencies(documents)).toEqual([])
  room.design_gate = "通過"
  expect(auditDesignDependencies(documents)).toContain("room-a: prerequisite design is unfinished: resident-a")
})

it("requires textile consuming rooms and recipients as supplier prerequisites, excluding in-document pool IDs", () => {
  const supplier: SettingDocument = { ...doc("resident-supplier"), kind: "residents" }
  const room = doc("room-a"),
    owner: SettingDocument = { ...doc("resident-owner"), kind: "residents" }
  supplier.textile_orders = [{ id: "cloth:finish", room: room.id, cloth: "cloth", beneficiary: owner.id, recipient: owner.id, stage: "finish", status: "proposed", pending: ["delivery"] }]
  supplier.textile_wool_lots = [
    {
      id: "internal-pool",
      preparation_facility: "facility-preparation",
      scope: "proposed_dry_unwashed_fleece_pool",
      status: "proposed",
      dry_mass_g: 1000,
      allocations: [{ room: room.id, cloth: "cloth" }],
      pending: ["real stock"],
    },
  ]
  const preparation: SettingDocument = { ...doc("facility-preparation"), kind: "facilities" }
  const documents = new Map([
    [supplier.id, supplier],
    [room.id, room],
    [owner.id, owner],
    [preparation.id, preparation],
  ])
  expect(auditDesignDependencies(documents)).toContain("resident-supplier: referenced prerequisite is missing from design dependencies: room-a")
  expect(auditDesignDependencies(documents)).toContain("resident-supplier: referenced prerequisite is missing from design dependencies: resident-owner")
  expect(auditDesignDependencies(documents)).toContain("resident-supplier: referenced prerequisite is missing from design dependencies: facility-preparation")
  supplier.design_dependencies = [room.id, owner.id, preparation.id]
  expect(auditDesignDependencies(documents)).toEqual([])
})

it("keeps preparation's operator, source water and owner inside its design prerequisites", () => {
  const facility = doc("facility-preparation"),
    operator = doc("resident-operator"),
    water = doc("facility-water"),
    home = doc("building-home")
  facility.kind = "facilities"
  operator.kind = "residents"
  water.kind = "facilities"
  home.kind = "buildings"
  facility.owner_building = home.id
  const vessel = { shape: "rectangular_cavity", inner_mm: [700, 400, 350], wall_mm: 20, bottom_mm: 25, freeboard_mm: 50, displacement_ml: 0 }
  facility.wool_preparation = {
    scope: "roofed_separate_wool_preparation_layout",
    status: "proposed",
    operator: operator.id,
    raw_pool: "internal-pool",
    water_source: water.id,
    zones: { dirty: [1, 1, 4, 10], clean: [6, 1, 5, 10] },
    vessels: { supply: vessel, wash: vessel, rinse: vessel, handwash: vessel, effluent: vessel },
    stations: { raw: "R", supply: "V", wash: "W", rinse: "C", handwash: "H", dry: "A", prepare: "T", clean: "K", effluent: "X" },
    batch_raw_g: 1000,
    water_budget: { wash_ml: 20000, rinse_ml: 20000, rinse_changes: 2, handwash_ml: 1000, supply_ml: 70000, effluent_ml: 80000, batches_before_service: 1 },
    disposal: "retention_only_no_discharge",
    final_disposal: null,
    pending: ["placement"],
  }
  const documents = new Map([facility, operator, water, home].map((document) => [document.id, document]))
  for (const prerequisite of [operator, water, home])
    expect(auditDesignDependencies(documents)).toContain(`${facility.id}: referenced prerequisite is missing from design dependencies: ${prerequisite.id}`)
  facility.design_dependencies = [operator.id, water.id, home.id]
  expect(auditDesignDependencies(documents)).toEqual([])
})
