import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { assertSettingShape } from "#/scripts/lib/setting-shape"
import { auditTownDistrictPlan } from "#/scripts/lib/audit-town-district-plan"
import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"

function fixture(id = "hue") {
  const town = readSetting(readFileSync(`.docs/settings/towns/town-${id}.md`, "utf8")),
    gate = readSetting(readFileSync(`.docs/settings/maps/map-${id}-gate.md`, "utf8")),
    plan = townDistrictPlanSchema.parse(town.town_district_plan)
  town.town_district_plan = plan
  return { town, plan, documents: new Map([town, gate].map((document) => [document.id, document])) }
}

it("checks each authored city study without turning reservations into live places or changing the documents", () => {
  for (const id of ["hue", "quynhon"]) {
    const source = fixture(id),
      before = JSON.stringify([...source.documents])
    expect(auditTownDistrictPlan(source)).toEqual([])
    expect(JSON.stringify([...source.documents])).toBe(before)
    expect(source.plan.origin_m).toBeNull()
    expect(source.plan.districts.every((district) => district.operator === null)).toBe(true)
    expect(source.town.design_gate).toBe("未通過")
  }
})

it("rejects orphaned reservations and missing life services", () => {
  const source = fixture()
  source.plan.districts = source.plan.districts.filter((district) => district.role !== "food")
  expect(auditTownDistrictPlan(source)).toContain("town-hue: Missing life district: food")
  expect(auditTownDistrictPlan(source)).toContain("town-hue: District grid contains an unassigned reservation")
})

it("requires an adjacent connected access rather than any reachable road", () => {
  const source = fixture()
  source.plan.districts[0].access = [6, 4]
  expect(auditTownDistrictPlan(source)).toContain("town-hue: W: district has no connected adjacent access")
  source.plan.districts[0].access = [1, 4]
  source.plan.rows[5] = "D#" + source.plan.rows[5].slice(2)
  expect(auditTownDistrictPlan(source)).toContain("town-hue: W: district has no connected adjacent access")
})

it("matches rectangles and symbols without clipping out-of-bounds districts", () => {
  const source = fixture()
  source.plan.districts[0].rect[2] = 100
  expect(auditTownDistrictPlan(source)).toContain("town-hue: W: district is outside its study")
  source.plan.districts[0].rect[2] = 3
  source.plan.districts[1].symbol = source.plan.districts[0].symbol
  expect(auditTownDistrictPlan(source)).toContain("town-hue: District symbols are duplicated")
})

it("keeps port-specific landing, cargo and visitor needs explicit", () => {
  const source = fixture("quynhon")
  source.plan.districts = source.plan.districts.filter((district) => district.role !== "dock")
  expect(auditTownDistrictPlan(source)).toContain("town-quynhon: Port study omits landing, cargo or visitor accommodation")
})

it("requires the declared gate and refuses passing an unplaced study", () => {
  const source = fixture()
  source.town.maps = []
  expect(auditTownDistrictPlan(source)).toContain("town-hue: District study has no declared gate map")
  source.town.design_gate = "通過"
  expect(auditTownDistrictPlan(source)).toContain("town-hue: Unplaced district study cannot clear the town design gate")
  source.town.town_district_plan = undefined
  expect(auditTownDistrictPlan(source)).toContain("town-hue: Invalid town district study")
})

it("rejects malformed or prematurely adopted metadata at the loading boundary", () => {
  const source = fixture()
  for (const change of [{ status: "designed" }, { origin_m: [0, 0] }, { entrance: [0.5, 5] }, { rows: [] }])
    expect(() => assertSettingShape({ ...source.town, town_district_plan: { ...source.plan, ...change } })).toThrow("Invalid settings structure")
  source.plan.rows[0] = "#"
  expect(auditTownDistrictPlan(source)).toContain("town-hue: Invalid district grid or entrance")
})

it("checks the district diagram against its own metadata without relaxing room-grid checks", () => {
  const source = readFileSync(".docs/settings/towns/town-hue.md", "utf8")
  expect(() => readSetting(source.replace("```district-grid\n#", "```district-grid\n."))).toThrow("District diagram disagrees with settings metadata")
})

it("does not accept an undeclared second entrance", () => {
  const source = fixture()
  source.plan.rows[14] = "D" + source.plan.rows[14].slice(1)
  expect(auditTownDistrictPlan(source)).toContain("town-hue: Invalid district grid or entrance")
})

it("rejects reserving the same district land for two complete home footprints", () => {
  const source = fixture(),
    home = readSetting(readFileSync(".docs/settings/buildings/building-hue-ludwig.md", "utf8"))
  home.district_reservation = { scope: "unplaced_town_district", status: "proposed", at_m: [1, 1], clearance_m: 1 }
  source.documents.set(home.id, home)
  source.documents.set("building-copy", { ...structuredClone(home), id: "building-copy" })
  expect(auditTownDistrictPlan(source)).toContain("town-hue: District land reservations overlap: building-hue-ludwig and building-copy")
})
