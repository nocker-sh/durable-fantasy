import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
import { auditFurnitureUse } from "#/scripts/lib/furniture-use"
import { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import { getWoolPreparationFacilityReview } from "#/scripts/lib/get-wool-preparation-facility-review"
import { auditWoolPreparation } from "#/scripts/lib/audit-wool-preparation"
import { WOOL_PREPARATION_STATIONS } from "#/scripts/lib/wool-preparation-stations"

function fixture() {
  const read = (path: string) => readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8")),
    facility = read("facilities/facility-h7-wool-preparation"),
    supplier = read("residents/resident-マティアス"),
    well = read("facilities/facility-square-well"),
    garden = read("facilities/facility-h7-garden")
  const plan = woolPreparationSchema.parse(facility.wool_preparation),
    documents = new Map([facility, supplier, well, garden].map((document) => [document.id, document]))
  facility.wool_preparation = plan
  return { facility, supplier, well, garden, plan, poolId: plan.raw_pool, documents }
}

it("gives all required operations their own owned stations and accessible work faces before graphics", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents]),
    review = getWoolPreparationFacilityReview(source)
  if (review instanceof Error) throw review
  expect(auditRoomGrid(source.facility)).toEqual([])
  expect(auditFurnitureUse(source.facility)).toEqual([])
  expect(new Set(Object.values(review.source.stations)).size).toBe(9)
  expect(review.water.reservedMl).toBe(61000)
  expect(auditWoolPreparation(source.documents)).toEqual([])
  expect(source.facility.design_gate).toBe("未通過")
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("refuses substituting or removing any operation's dedicated work face", () => {
  for (const station of WOOL_PREPARATION_STATIONS) {
    const source = fixture(),
      piece = source.facility.furniture?.find((piece) => piece.symbol === source.plan.stations[station.station])
    if (!piece) throw new Error("Missing authored preparation station")
    piece.use_space = []
    expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  }
  const source = fixture()
  source.plan.stations.rinse = source.plan.stations.wash
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool preparation shares a station or belongs to another raw pool"))
})

it("requires the actual operator, separate ownership and a declared water-collection user", () => {
  const source = fixture()
  source.facility.owner_building = "building-h1"
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  source.facility.owner_building = "building-h7"
  source.facility.users = []
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  source.facility.users = [source.supplier.id]
  source.well.users = []
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool preparation has no declared source-water user"))
  source.plan.water_source = source.garden.id
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool preparation has no declared source-water user"))
})

it("refuses another batch without service and does not invent a final outfall", () => {
  const source = fixture()
  source.plan.water_budget.batches_before_service = 2
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  expect(woolPreparationSchema.safeParse({ ...source.plan, disposal: "river" }).success).toBe(false)
  expect(woolPreparationSchema.safeParse({ ...source.plan, final_disposal: "facility-h8-treatment" }).success).toBe(false)
})

it("reverse-audits an extra facility and keeps placement and disposal outside a completed gate", () => {
  const source = fixture(),
    copy = { ...source.facility, id: "facility-copy" }
  source.documents.set(copy.id, copy)
  expect(auditWoolPreparation(source.documents)).toContain("facility-copy: wool-preparation: Missing matching raw pool")
  source.documents.delete(copy.id)
  source.facility.design_gate = "通過"
  expect(auditWoolPreparation(source.documents)).toContain(`${source.facility.id}: wool-preparation: Placement, handling and final disposal remain unresolved`)
})

it("does not accept a combined garden, water-collection or animal-care site as the wool work area", () => {
  const source = fixture()
  source.facility.ground_feature = source.garden.ground_feature
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  delete source.facility.ground_feature
  source.facility.water_collection = source.well.water_collection
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  delete source.facility.water_collection
  source.facility.animal_care = { keeper: source.supplier.id }
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
})

it("requires a dedicated dry-fibre work face before prepared wool can enter storage", () => {
  const source = fixture()
  expect(woolPreparationSchema.safeParse({ ...source.plan, stations: { ...source.plan.stations, prepare: undefined } }).success).toBe(false)
  source.plan.stations.prepare = source.plan.stations.clean
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
})

it("requires constructed liquid spaces rather than an unsupported declared capacity", () => {
  const source = fixture()
  expect(woolPreparationSchema.safeParse({ ...source.plan, vessels: undefined }).success).toBe(false)
})

it("checks every basin and tank against its own required fill", () => {
  for (const station of ["supply", "wash", "rinse", "handwash", "effluent"] satisfies (keyof ReturnType<typeof fixture>["plan"]["vessels"])[]) {
    const source = fixture()
    source.plan.vessels[station].inner_mm = [100, 100, 100]
    source.plan.vessels[station].displacement_ml = 0
    expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
  }
})

it("keeps full-capacity boundaries exact and refuses a tank larger than its footprint", () => {
  const source = fixture()
  source.plan.water_budget.supply_ml = 85750
  expect(getWoolPreparationFacilityReview(source)).not.toBeInstanceOf(Error)
  source.plan.water_budget.supply_ml += 1
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool vessel working capacity is smaller than its reserved water"))
  source.plan.water_budget.supply_ml = 70000
  source.plan.vessels.supply.inner_mm = [1000, 400, 350]
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool vessel exceeds its station footprint"))
})

it("does not fill a wool basin to the rim or ignore immersed fleece", () => {
  const source = fixture()
  source.plan.vessels.wash.displacement_ml = 0
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool basin has no allowance for immersed fleece"))
  expect(woolPreparationSchema.safeParse({ ...source.plan, vessels: { ...source.plan.vessels, rinse: { ...source.plan.vessels.rinse, freeboard_mm: 0 } } }).success).toBe(false)
  source.plan.vessels.wash.displacement_ml = 30000
  expect(getWoolPreparationFacilityReview(source)).toBeInstanceOf(Error)
})

it("requires explicit dirty and clean areas before treating the arrangement as separated", () => {
  const source = fixture()
  expect(woolPreparationSchema.safeParse({ ...source.plan, zones: undefined }).success).toBe(false)
})

it("rejects swapping raw and prepared storage even when every work face remains reachable", () => {
  const source = fixture(),
    raw = source.facility.furniture?.find((piece) => piece.symbol === "R"),
    clean = source.facility.furniture?.find((piece) => piece.symbol === "K")
  if (!raw || !clean || !source.facility.grid) throw new Error("Missing authored storage")
  const original = { rect: raw.rect, access: raw.access, use_space: raw.use_space }
  raw.rect = clean.rect
  raw.access = clean.access
  raw.use_space = clean.use_space
  clean.rect = original.rect
  clean.access = original.access
  clean.use_space = original.use_space
  source.facility.grid.rows = source.facility.grid.rows.map((row) => row.replace(/[RK]/g, (symbol) => (symbol === "R" ? "K" : "R")))
  expect(auditRoomGrid(source.facility)).toEqual([])
  expect(auditFurnitureUse(source.facility)).toEqual([])
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool station or work face leaves its assigned area"))
})

it("requires separate bounded areas and keeps all of a work face on its assigned side", () => {
  const source = fixture()
  source.plan.zones.clean = [4, 1, 7, 10]
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool dirty and clean work areas overlap"))
  source.plan.zones.clean = [6, 1, 50, 10]
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool work area is missing or outside its grid"))
  source.plan.zones.clean = [6, 1, 5, 10]
  const dry = source.facility.furniture?.find((piece) => piece.symbol === "A")
  if (!dry?.use_space) throw new Error("Missing authored drying face")
  dry.use_space[0].rect = [4, 1, 4, 2]
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool station or work face leaves its assigned area"))
})

it("rejects a clean-side detour through the dirty side despite global doorway reachability", () => {
  const source = fixture()
  if (!source.facility.grid) throw new Error("Missing authored grid")
  source.facility.grid.rows[3] = "D.......TT.#"
  source.facility.grid.rows[4] = "D....###TT##"
  expect(auditRoomGrid(source.facility)).toEqual([])
  expect(getWoolPreparationFacilityReview(source)).toEqual(new Error("Wool work faces require leaving their assigned area"))
})
