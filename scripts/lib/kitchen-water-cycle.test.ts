import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { kitchenWaterCycleSchema } from "#/scripts/lib/kitchen-water-cycle-schema"
import { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import { getKitchenWaterCycleError } from "#/scripts/lib/get-kitchen-water-cycle-error"
import { getWaterStockCycle } from "#/world/town/get-water-stock-cycle"
const fixture = () => {
  const paths = [
    "residents/resident-ルードヴィヒ",
    "towns/town-hue",
    "maps/map-hue-quarter",
    "buildings/building-hue-ludwig",
    ...["1", "2", "hall", "wash", "toilet", "fuel"].map((room) => `rooms/room-hue-ludwig-${room}`),
  ]
  const documents = new Map(
    paths.map((path) => {
      const document = readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8"))
      return [document.id, document]
    }),
  )
  const room = documents.get("room-hue-ludwig-1")
  if (!room) throw new Error("Missing kitchen")
  const plan = kitchenWaterCycleSchema.parse(room.kitchen_water_cycle)
  room.kitchen_water_cycle = plan
  return { room, documents, plan }
}

it("binds the complete authored kitchen account to the workday and retains next morning's water", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getKitchenWaterCycleError(source)).toBeNull()
  expect(getWaterStockCycle({ initial_ml: source.plan.initial_ml, capacity_ml: 23400, events: source.plan.events })).toMatchObject({
    finalMl: 5000,
    minimumMl: 0,
    maximumMl: 15000,
    receivedMl: 15000,
    usedMl: 15000,
  })
  expect(JSON.stringify([...source.documents])).toBe(before)
  expect(source.plan.source_operator).toBeNull()
  expect(source.room.design_gate).toBe("未通過")
})

it("refuses the missing opening reserve despite matching daily receipt and usage totals", () => {
  const source = fixture()
  source.plan.initial_ml = 0
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Water is reserved before enough stock is available"))
})

it("cannot credit water before it is collected and transferred into the kitchen", () => {
  const source = fixture(),
    receipt = source.plan.events.find((event) => event.kind === "receive")
  if (!receipt || receipt.kind !== "receive") throw new Error("Missing receipt")
  receipt.at_min = receipt.task_from_min
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen refill is available before its transfer finishes"))
  receipt.at_min = 625
  receipt.collection_from_min = 615
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen refill has no preceding collection in its source district"))
  receipt.collection_from_min = 590
  source.plan.source_district = "W"
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen refill has no preceding collection in its source district"))
})

it("requires every preparation and cleanup once, in its actual room and before the work starts", () => {
  const source = fixture(),
    withdrawal = source.plan.events[0]
  if (withdrawal.kind !== "use") throw new Error("Missing withdrawal")
  withdrawal.at_min++
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen water withdrawal does not precede its assigned task"))
  withdrawal.at_min--
  withdrawal.task_from_min = 485
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen water event has no matching room task"))
  source.plan.events.shift()
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen workday has an unreserved water task"))
  const duplicate = fixture()
  duplicate.plan.events.splice(1, 0, { ...duplicate.plan.events[0] })
  expect(getKitchenWaterCycleError(duplicate)).toEqual(new Error("Kitchen water task is reserved more than once"))
})

it("binds the washing withdrawal to the same owned vessel and the reserved effluent quantity", () => {
  const source = fixture(),
    washing = source.plan.events.find((event) => event.kind === "use" && event.purpose === "dishwashing")
  if (!washing) throw new Error("Missing washing")
  washing.volume_ml--
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen withdrawal disagrees with retained dishwater"))
  washing.volume_ml++
  source.plan.fresh_symbol = "X"
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen water has no matching operator and dishwater account"))
  source.plan.fresh_symbol = "V"
  source.plan.operator = "resident-other"
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen water has no matching operator and dishwater account"))
})

it("retains exact cavity and wall constraints and cannot make the stock cycle certify disposal", () => {
  const source = fixture()
  source.plan.vessel.inner_mm[1] = 100
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Water refill exceeds working capacity"))
  source.plan.vessel.inner_mm[1] = 300
  source.plan.vessel.inner_mm[0] = 470
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Liquid vessel walls exceed their furniture footprint"))
  source.plan.vessel.inner_mm[0] = 300
  const capture = dishwaterCaptureSchema.parse(source.room.dishwater_capture)
  source.room.dishwater_capture = { ...capture, final_disposal: "street" }
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Invalid kitchen water cycle proposal"))
})

it("does not omit the local refill or credit the same collection to a second transfer", () => {
  const missing = fixture()
  missing.plan.events = missing.plan.events.filter((event) => event.kind !== "receive")
  expect(getKitchenWaterCycleError(missing)).toEqual(new Error("Kitchen workday has an unreserved water task"))
  const source = fixture(),
    resident = source.documents.get("resident-ルードヴィヒ")
  if (!resident) throw new Error("Missing resident")
  const proposal = residentProposalSchema.parse(resident.resident_proposal),
    day = proposal.day_plan
  if (!day) throw new Error("Missing day")
  const index = day.segments.findIndex((segment) => segment.kind === "stay" && segment.activity === "rest" && segment.from_min === 1290),
    rest = day.segments[index]
  if (rest.kind !== "stay") throw new Error("Missing evening rest")
  day.segments.splice(index, 1, { ...rest, to_min: 1300 }, { ...rest, from_min: 1300, to_min: 1310, activity: "water" }, { ...rest, from_min: 1310 })
  resident.resident_proposal = proposal
  source.plan.events.push({ kind: "receive", at_min: 1310, volume_ml: 15000, task_from_min: 1300, collection_from_min: 590 })
  expect(getKitchenWaterCycleError(source)).toEqual(new Error("Kitchen refill credits the same collection more than once"))
})
