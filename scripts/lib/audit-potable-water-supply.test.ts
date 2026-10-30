import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { auditPotableWaterSupply } from "#/scripts/lib/audit-potable-water-supply"
import { auditTransportContainers } from "#/scripts/lib/transport-containers"
import { potableWaterSupplySchema } from "#/scripts/lib/potable-water-supply-schema"
import { readSetting } from "#/scripts/lib/read-setting"
const fixture = () => {
  const documents = new Map(
    ["rooms/room-h1-2", "buildings/building-h1", "residents/resident-ゾフィー", "residents/resident-ヴィルヘルム", "facilities/facility-square-well"].map((path) => {
      const doc = readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
      return [doc.id, doc] satisfies [string, typeof doc]
    }),
  )
  const room = documents.get("room-h1-2"),
    source = documents.get("facility-square-well"),
    carrier = documents.get("resident-ゾフィー")
  if (!room || !source || !carrier) throw new Error("Missing domestic water fixture")
  const supply = potableWaterSupplySchema.parse(room.potable_water_supply),
    vessel = room.furniture?.find((part) => part.symbol === supply.container_symbol)?.transport_container
  if (!vessel) throw new Error("Missing water vessel")
  room.potable_water_supply = supply
  return { documents, room, source, carrier, supply, vessel, audit: () => auditPotableWaterSupply(room, documents) }
}
it("binds the source household plan to one placed vessel and retains the proposed-operation gate", () => {
  const f = fixture()
  expect(auditTransportContainers(f.documents)).toEqual([])
  expect(f.audit()).toEqual([])
  expect(auditPotableWaterSupply(f.source, f.documents)).toEqual([])
  f.room.design_gate = "通過"
  expect(f.audit()).toContain("room-h1-2: Water collection and daily supply remain unverified")
  f.source.design_gate = "通過"
  expect(auditPotableWaterSupply(f.source, f.documents)).toContain("facility-square-well: Water quality and collection site remain unverified")
})
it("refuses an unregistered carrier and a collection site also used for waste treatment", () => {
  const f = fixture()
  f.source.users = []
  expect(f.audit()).toContain("room-h1-2: Water collection site does not register this home and carrier")
  f.source.users = [f.carrier.id]
  f.source.sanitation_role = "treatment"
  expect(f.audit()).toContain("room-h1-2: Water collection site is not a potable supply proposal")
})
it("refuses another household and inaccessible rooms", () => {
  const f = fixture()
  f.carrier.household = "smith"
  expect(f.audit()).toContain("room-h1-2: Water carrier does not belong to this household")
  f.carrier.household = "elder"
  f.room.private_for = ["resident-ヴィルヘルム"]
  expect(f.audit()).toContain("room-h1-2: Water carrier cannot use this household room")
})
it("requires the same clean placed vessel and rejects waste aliases", () => {
  const f = fixture()
  f.supply.container_id = "different-vessel"
  expect(f.audit()).toContain("room-h1-2: Water supply has no matching placed vessel")
  f.supply.container_id = f.vessel.id
  f.vessel.stream = "greywater"
  expect(f.audit()).toContain("room-h1-2: Water supply requires its dedicated lidded glazed vessel")
  f.vessel.stream = "potable_water"
  f.room.material_routes = [{ container_id: f.vessel.id, container_symbol: "Q" }]
  expect(f.audit()).toContain("room-h1-2: Drinking water vessel is reused by a waste route")
})
it("counts the empty vessel in the carried mass and rejects excessive fill", () => {
  const f = fixture()
  f.vessel.empty_mass_kg = 4
  expect(f.audit()).toContain("room-h1-2: Filled water vessel exceeds the carrier's planned hand load")
  f.vessel.empty_mass_kg = 3
  f.supply.max_fill_l = f.vessel.capacity_l + 1
  expect(f.audit()).toContain("room-h1-2: Water operating fill exceeds capacity or has invalid mass")
})
it("rejects missing handling assumptions, malformed data and missing prerequisites", () => {
  const f = fixture()
  delete f.carrier.handling_plan
  expect(f.audit()).toContain("room-h1-2: Water carrier has no usable handling assumption")
  f.room.design_dependencies = []
  expect(f.audit()).toContain("room-h1-2: Water supply prerequisites are missing")
  f.room.potable_water_supply = { ...f.supply, max_fill_l: NaN }
  expect(f.audit()).toEqual(["room-h1-2: Invalid planned water supply"])
})

it("keeps the source town and unfinished water-quality conditions explicit", () => {
  const f = fixture()
  f.source.town = "town-hue"
  expect(f.audit()).toContain("room-h1-2: Water supply has no matching home, carrier or town facility")
  f.source.town = "town-phanthiet"
  f.source.water_collection = { purpose: "potable_supply", status: "proposed", pending: [] }
  expect(f.audit()).toContain("room-h1-2: Water collection site is not a potable supply proposal")
  f.supply.pending = []
  expect(f.audit()).toEqual(["room-h1-2: Invalid planned water supply"])
})

it("does not turn the drinking-water pot into the washing bucket or drying support", () => {
  const f = fixture()
  for (const role of ["washed_at", "support", "dry_storage"]) {
    f.room.dish_drying = { [role]: f.supply.container_symbol }
    expect(f.audit()).toContain("room-h1-2: Drinking water vessel is reused by dish handling")
  }
})

it("registers every household water user and refuses an invented reserve", () => {
  const f = fixture(),
    plan = f.supply.stock_plan
  if (!plan) throw new Error("Missing source water stock plan")
  plan.users = [f.carrier.id]
  expect(f.audit()).toContain("room-h1-2: Water stock plan does not cover each home user once")
  plan.users = [f.carrier.id, f.carrier.id]
  expect(f.audit()).toContain("room-h1-2: Water stock plan does not cover each home user once")
  plan.users = [f.carrier.id, "resident-ヴィルヘルム"]
  f.documents.delete("resident-ヴィルヘルム")
  expect(f.audit()).toContain("room-h1-2: Water stock user does not belong to this home")
  expect(potableWaterSupplySchema.safeParse({ ...f.supply, stock_plan: { ...plan, reserve_container_ids: ["unplaced-reserve"] } }).success).toBe(false)
})
it("keeps stock prerequisites and the millilitre operating limit explicit", () => {
  const f = fixture()
  f.room.design_dependencies = ["building-h1", f.source.id, f.carrier.id]
  expect(f.audit()).toContain("room-h1-2: Water stock user prerequisites are missing")
  f.supply.max_fill_l = 0.00001
  expect(f.audit()).toContain("room-h1-2: Household water fill must fit an exact millilitre ledger")
})

it("keeps named stock users one-to-one with actual home residents", () => {
  const f = fixture(),
    grandfather = f.documents.get("resident-ヴィルヘルム")
  if (!grandfather) throw new Error("Missing home user")
  grandfather.title = f.carrier.title
  expect(f.audit()).toContain("room-h1-2: Water stock user does not belong to this home")
  grandfather.title = "ヴィルヘルム"
  grandfather.town = "town-hue"
  expect(f.audit()).toContain("room-h1-2: Water stock user does not belong to this home")
})

it("does not bypass household availability by removing the stock plan", () => {
  const f = fixture()
  f.room.potable_water_supply = { ...f.supply, stock_plan: undefined }
  expect(f.audit()).toEqual(["room-h1-2: Invalid planned water supply"])
})
