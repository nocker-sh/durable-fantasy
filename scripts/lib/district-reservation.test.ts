import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import { getBuildingDistrictReservation } from "#/scripts/lib/get-building-district-reservation"
import { getTownDistrictReservationErrors } from "#/scripts/lib/get-town-district-reservation-errors"
import type { SettingDocument } from "#/scripts/lib/setting-document"

function fixture() {
  const building = readSetting(readFileSync(".docs/settings/buildings/building-hue-ludwig.md", "utf8")),
    town = readSetting(readFileSync(".docs/settings/towns/town-hue.md", "utf8")),
    plan = townDistrictPlanSchema.parse(town.town_district_plan)
  return { building, town, townId: town.id, plan }
}

function smallBuilding(id: string, x: number): SettingDocument {
  return {
    id,
    kind: "buildings",
    title: id,
    source: "test",
    status: "設計中",
    design_gate: "未通過",
    issues: ["unplaced"],
    town: "town-hue",
    proposed_district: "H",
    layout: { cell_m: 0.5, width: 4, depth: 4 },
    district_reservation: { scope: "unplaced_town_district", status: "proposed", at_m: [x, 1], clearance_m: 1 },
  }
}

it("reserves the full authored floor and clear perimeter without pretending it is a mapped site", () => {
  const source = fixture(),
    before = JSON.stringify(source)
  expect(getBuildingDistrictReservation(source)).toEqual({ id: "building-hue-ludwig", district: "H", bounds: [0, 0, 12, 10.5] })
  expect(JSON.stringify(source)).toBe(before)
  expect(source.plan.origin_m).toBeNull()
  expect(source.building.design_gate).toBe("未通過")
})

it("keeps exact district edges and refuses even a small overrun", () => {
  const source = fixture()
  source.building.district_reservation = { scope: "unplaced_town_district", status: "proposed", at_m: [1, 1], clearance_m: 1 }
  expect(getBuildingDistrictReservation(source)).not.toBeInstanceOf(Error)
  source.building.district_reservation = { scope: "unplaced_town_district", status: "proposed", at_m: [1.000001, 1], clearance_m: 1 }
  expect(getBuildingDistrictReservation(source)).toEqual(new Error("Building and clear perimeter exceed their district reservation"))
})

it("does not shrink the clear perimeter to fit a larger floor or place it outside the district", () => {
  const source = fixture()
  source.building.district_reservation = { scope: "unplaced_town_district", status: "proposed", at_m: [1, 1], clearance_m: 0.5 }
  expect(getBuildingDistrictReservation(source)).toBeInstanceOf(Error)
  source.building.district_reservation = { scope: "unplaced_town_district", status: "proposed", at_m: [0.5, 1], clearance_m: 1 }
  expect(getBuildingDistrictReservation(source)).toBeInstanceOf(Error)
})

it("requires a declared reservation once an unplaced building has a floor layout", () => {
  const source = fixture()
  delete source.building.district_reservation
  expect(getBuildingDistrictReservation(source)).toEqual(new Error("Invalid building district reservation"))
  delete source.building.layout
  expect(getBuildingDistrictReservation(source)).toBeNull()
})

it("rejects invalid sizes, wrong document kinds and a premature completed gate", () => {
  const source = fixture()
  source.building.layout = { cell_m: 1e308, width: 100, depth: 100 }
  expect(getBuildingDistrictReservation(source)).toBeInstanceOf(Error)
  source.building = fixture().building
  source.building.kind = "rooms"
  expect(getBuildingDistrictReservation(source)).toEqual(new Error("Invalid building district reservation"))
  source.building = fixture().building
  source.building.design_gate = "通過"
  expect(getBuildingDistrictReservation(source)).toEqual(new Error("Unplaced district reservation cannot clear the building gate"))
})

it("distinguishes touching clear envelopes from overlapping or twice-reserved land", () => {
  const source = fixture(),
    first = smallBuilding("building-first", 1),
    next = smallBuilding("building-next", 5),
    documents = new Map([
      [first.id, first],
      [next.id, next],
    ])
  expect(getTownDistrictReservationErrors({ ...source, documents })).toEqual([])
  next.district_reservation = { scope: "unplaced_town_district", status: "proposed", at_m: [4.999999, 1], clearance_m: 1 }
  expect(getTownDistrictReservationErrors({ ...source, documents })).toEqual(["District land reservations overlap: building-first and building-next"])
  next.proposed_district = "J"
  expect(getTownDistrictReservationErrors({ ...source, documents })).toEqual([])
})
